import express from 'express';
import { authorize } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const toDateOnly = (date) => date.toISOString().split('T')[0];

// Funções que respeitam o timezone LOCAL do sistema
const startOfDay = (date) => {
  const d = new Date(date);
  // Criar nova data no timezone local, com hora 00:00:00
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const result = new Date(year, month, day, 0, 0, 0, 0);
  console.log('[startOfDay] Input:', d.toISOString(), 'Output:', result.toISOString(), 'Local:', result.toString());
  return result;
};

const endOfDay = (date) => {
  const d = new Date(date);
  // Criar nova data no timezone local, com hora 23:59:59
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const result = new Date(year, month, day, 23, 59, 59, 999);
  console.log('[endOfDay] Input:', d.toISOString(), 'Output:', result.toISOString(), 'Local:', result.toString());
  return result;
};

const parseDateOnlyLocal = (value) => {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(year, month, day, 0, 0, 0, 0);
};

const formatDateOnlyLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const safeDate = (value, fallback) => {
  if (!value) return fallback;
  const local = parseDateOnlyLocal(value);
  if (local) return local;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const router = express.Router();

// GET /api/reports/daily-movement
router.get('/daily-movement', authorize('admin'), async (req, res) => {
  try {
    const valetClientId = req.user.valetClientId;
    
    if (!valetClientId) {
      return res.status(403).json({
        success: false,
        message: 'Usuário não está associado a um valet',
      });
    }

    const today = new Date();
    const todayStr = formatDateOnlyLocal(today);
    
    // Determinar se é período ou apenas hoje
    // Se start_date === end_date === hoje, então é "Hoje" (não é período)
    let start, end, date, queryDate;

    if (req.query.date) {
      const requestedDate = safeDate(req.query.date, today) || today;
      queryDate = requestedDate;
      date = formatDateOnlyLocal(requestedDate);
      start = startOfDay(requestedDate);
      end = endOfDay(requestedDate);
    } else if (req.query.start_date && req.query.end_date) {
      const startDateStr = req.query.start_date;
      const endDateStr = req.query.end_date;
      
      // Se start === end === hoje, usar apenas hoje (modo "Hoje")
      if (startDateStr === endDateStr && startDateStr === todayStr) {
        queryDate = today;
        date = toDateOnly(queryDate);
        start = startOfDay(queryDate);
        end = endOfDay(queryDate);
      } else {
        // Período customizado (7 dias, 30 dias, etc)
        const startDateLocal = parseDateOnlyLocal(startDateStr) || new Date(req.query.start_date);
        const endDateLocal = parseDateOnlyLocal(endDateStr) || new Date(req.query.end_date);
        queryDate = startDateLocal;
        start = startOfDay(startDateLocal);
        end = endOfDay(endDateLocal);
        date = `${startDateStr} a ${endDateStr}`;
      }
    } else {
      // Apenas hoje (padrão, sem parâmetros)
      queryDate = today;
      date = toDateOnly(queryDate);
      start = startOfDay(queryDate);
      end = endOfDay(queryDate);
    }

    const [entriesCount, exitsCount, parkedCount, entries, exits] = await Promise.all([
      prisma.vehicleEntry.count({
        where: {
          entryTime: { gte: start, lte: end },
          valetClientId, // ISOLAMENTO
        },
      }),
      prisma.vehicleEntry.count({
        where: {
          exitTime: { gte: start, lte: end },
          valetClientId, // ISOLAMENTO
        },
      }),
      prisma.vehicleEntry.count({
        where: {
          status: 'parked',
          valetClientId, // ISOLAMENTO
        },
      }),
      prisma.vehicleEntry.findMany({
        where: {
          entryTime: { gte: start, lte: end },
          valetClientId, // ISOLAMENTO
        },
        select: {
          id: true,
          entryTime: true,
          vehicleId: true,
        },
      }),
      prisma.vehicleEntry.findMany({
        where: {
          exitTime: { gte: start, lte: end },
          valetClientId, // ISOLAMENTO
        },
        select: {
          entryTime: true,
          exitTime: true,
        },
      }),
    ]);

    const uniqueVehicles = new Set(entries.map((item) => item.vehicleId)).size;

    const durations = exits
      .filter((item) => item.exitTime)
      .map((item) => (item.exitTime.getTime() - item.entryTime.getTime()) / 60000);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
      : 0;

    const entriesByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      entries: 0,
    }));
    entries.forEach((item) => {
      const hour = item.entryTime.getHours();
      entriesByHour[hour].entries += 1;
    });

    const peakHour = entriesByHour.reduce(
      (max, item) => (item.entries > max.entries ? item : max),
      { hour: 0, entries: 0 }
    ).hour;

    console.log('[DEBUG] Daily Movement Stats:', {
      entriesCount,
      exitsCount,
      parkedCount,
      uniqueVehicles,
      avgDuration,
      peakHour,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      entriesFound: entries.length,
      exitsFound: exits.length,
    });

    let history = [];
    const startDateQuery = safeDate(req.query.start_date, null);
    const endDateQuery = safeDate(req.query.end_date, null);

    if (startDateQuery || endDateQuery) {
      const rangeStart = startDateQuery ? startOfDay(startDateQuery) : startOfDay(queryDate);
      const rangeEnd = endDateQuery ? endOfDay(endDateQuery) : endOfDay(queryDate);

      const [entriesByDay, exitsByDay] = await Promise.all([
        prisma.$queryRaw`
          SELECT DATE("entryTime")::text as day, COUNT(*)::int as entries
          FROM vehicle_entries
          WHERE "entryTime" BETWEEN ${rangeStart} AND ${rangeEnd}
          AND "valetClientId" = ${valetClientId}
          GROUP BY 1
          ORDER BY day ASC
        `,
        prisma.$queryRaw`
          SELECT DATE("exitTime")::text as day, COUNT(*)::int as exits
          FROM vehicle_entries
          WHERE "exitTime" BETWEEN ${rangeStart} AND ${rangeEnd}
          AND "valetClientId" = ${valetClientId}
          GROUP BY 1
          ORDER BY day ASC
        `,
      ]);

      const daysMap = new Map();
      entriesByDay.forEach((row) => {
        daysMap.set(row.day, { date: row.day, entries: Number(row.entries), exits: 0 });
      });
      exitsByDay.forEach((row) => {
        const existing = daysMap.get(row.day) || { date: row.day, entries: 0, exits: 0 };
        existing.exits = Number(row.exits);
        daysMap.set(row.day, existing);
      });
      history = Array.from(daysMap.values());
    }

    res.json({
      date,
      summary: {
        total_entries: entriesCount,
        total_exits: exitsCount,
        currently_parked: parkedCount,
        unique_vehicles: uniqueVehicles,
        avg_parking_duration_minutes: avgDuration,
        peak_hour: peakHour,
        entries_by_hour: entriesByHour,
      },
      history,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter movimento do dia',
      code: 'DAILY_MOVEMENT_ERROR',
      message: error.message,
    });
  }
});

// GET /api/reports/peak-hours
router.get('/peak-hours', authorize('admin'), async (req, res) => {
  try {
    const valetClientId = req.user.valetClientId;
    
    if (!valetClientId) {
      return res.status(403).json({
        success: false,
        message: 'Usuário não está associado a um valet',
      });
    }

    const groupBy = req.query.group_by || 'hour';
    const days = parseInt(req.query.days, 10) || 7;
    const allTime = req.query.all_time === '1' || req.query.all_time === 'true';
    // Sempre usar data do servidor (não do cliente) para evitar problemas de timezone
    const today = new Date();
    
    // Se o frontend enviou start_date e end_date, calcular o range baseado nisso
    // mas sempre usando as datas no timezone do servidor
    let rangeStart, rangeEnd;

    if (allTime) {
      const [firstEntry, lastEntry] = await Promise.all([
        prisma.vehicleEntry.findFirst({
          where: { valetClientId },
          orderBy: { entryTime: 'asc' },
          select: { entryTime: true },
        }),
        prisma.vehicleEntry.findFirst({
          where: { valetClientId },
          orderBy: { entryTime: 'desc' },
          select: { entryTime: true },
        }),
      ]);

      if (!firstEntry || !lastEntry) {
        return res.json({
          start_date: null,
          end_date: null,
          group_by: groupBy,
          data: [],
          highest_peak: null,
          avg_movements: 0,
        });
      }

      rangeStart = startOfDay(firstEntry.entryTime);
      rangeEnd = endOfDay(lastEntry.entryTime);
    } else if (req.query.start_date && req.query.end_date) {
      // Frontend enviou datas específicas (ex: período "today")
      // Usar as datas informadas no timezone local do servidor
      const start = parseDateOnlyLocal(req.query.start_date) || new Date(req.query.start_date);
      const end = parseDateOnlyLocal(req.query.end_date) || new Date(req.query.end_date);
      rangeStart = startOfDay(start);
      rangeEnd = endOfDay(end);
    } else {
      // Usar o parâmetro days (padrão: 7)
      const defaultStart = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      rangeStart = startOfDay(defaultStart);
      rangeEnd = endOfDay(today);
    }

    console.log('[PEAK HOURS] Query params:', { start_date: req.query.start_date, end_date: req.query.end_date, group_by: groupBy, all_time: allTime });
    console.log('[PEAK HOURS] Range:', { rangeStart: rangeStart.toISOString(), rangeEnd: rangeEnd.toISOString() });
    
    // Buscar todas as entradas e saídas no período
    const [entries, exits] = await Promise.all([
      prisma.vehicleEntry.findMany({
        where: {
          valetClientId,
          entryTime: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        select: {
          entryTime: true,
        },
      }),
      prisma.vehicleEntry.findMany({
        where: {
          valetClientId,
          exitTime: {
            gte: rangeStart,
            lte: rangeEnd,
            not: null,
          },
        },
        select: {
          exitTime: true,
        },
      }),
    ]);

    console.log('[reportRoutes] Entries found:', entries.length, 'Exits found:', exits.length);
    if (entries.length > 0) {
      console.log('[PEAK HOURS] Sample entries:', entries.slice(0, 3).map(e => ({ 
        entryTime: e.entryTime.toISOString(), 
        local: e.entryTime.toString() 
      })));
    }

    // Função para extrair o label baseado no groupBy
    // IMPORTANTE: Usa componentes de data LOCAL, não UTC
    const getLabel = (date, groupBy) => {
      if (!date) return null;
      
      const d = new Date(date);
      if (groupBy === 'hour') {
        // Retorna apenas a hora LOCAL: "8", "19", etc
        return d.getHours().toString();
      } else if (groupBy === 'day') {
        // Retorna YYYY-MM-DD usando componentes locais
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else if (groupBy === 'month') {
        // Retorna YYYY-MM
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      } else if (groupBy === 'year') {
        // Retorna YYYY
        return d.getFullYear().toString();
      }
      return null;
    };

    // Agrupar entries
    const entriesMap = new Map();
    entries.forEach((entry) => {
      const label = getLabel(entry.entryTime, groupBy);
      if (label) {
        entriesMap.set(label, (entriesMap.get(label) || 0) + 1);
      }
    });

    // Agrupar exits
    const exitsMap = new Map();
    exits.forEach((exit) => {
      const label = getLabel(exit.exitTime, groupBy);
      if (label) {
        exitsMap.set(label, (exitsMap.get(label) || 0) + 1);
      }
    });

    console.log('[reportRoutes] entriesMap:', Array.from(entriesMap.entries()));
    console.log('[reportRoutes] exitsMap:', Array.from(exitsMap.entries()));

    // Combinar os dados
    const allLabels = new Set([...entriesMap.keys(), ...exitsMap.keys()]);
    console.log('[reportRoutes] All labels before sorting:', Array.from(allLabels));
    console.log('[reportRoutes] Sample entries that created labels:', entries.slice(0, 3).map(e => ({
      time: e.entryTime?.toString(),
      label: getLabel(e.entryTime, groupBy)
    })));

    const map = new Map();

    allLabels.forEach((label) => {
      map.set(label, {
        label,
        entries: entriesMap.get(label) || 0,
        exits: exitsMap.get(label) || 0,
      });
    });

    const data = Array.from(map.values()).map((item) => ({
      ...item,
      // Horário de pico considera apenas entradas
      total_movements: item.entries,
    })).sort((a, b) => {
      // Ordenar os labels de forma correta
      if (groupBy === 'hour') {
        return parseInt(a.label) - parseInt(b.label);
      } else if (groupBy === 'day' || groupBy === 'month') {
        return a.label.localeCompare(b.label);
      } else if (groupBy === 'year') {
        return parseInt(a.label) - parseInt(b.label);
      }
      return 0;
    });

    console.log('[reportRoutes] Map values before response:', Array.from(map.values()));
    console.log('[reportRoutes] Final data with total_movements:', data);
    console.log('[reportRoutes] Peak hours data:', { groupBy, count: data.length, samples: data.slice(0, 3) });

    const highest = data.reduce(
      (max, item) => (item.total_movements > max.total_movements ? item : max),
      { label: null, total_movements: 0 }
    );

    const avgMovements = data.length
      ? Math.round(data.reduce((sum, item) => sum + item.total_movements, 0) / data.length)
      : 0;

    res.json({
      start_date: formatDateOnlyLocal(rangeStart),
      end_date: formatDateOnlyLocal(rangeEnd),
      group_by: groupBy,
      data,
      highest_peak: highest.label,
      avg_movements: avgMovements,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter horários de pico',
      code: 'PEAK_HOURS_ERROR',
      message: error.message,
    });
  }
});

// GET /api/reports/vehicles
router.get('/vehicles', authorize('admin'), async (req, res) => {
  try {
    const valetClientId = req.user.valetClientId;
    
    if (!valetClientId) {
      return res.status(403).json({
        success: false,
        message: 'Usuário não está associado a um valet',
      });
    }

    // Usar start_date e end_date da query, ou hoje como fallback
    const { start_date, end_date } = req.query;
    const today = new Date();
    
    let rangeStart, rangeEnd;
    if (start_date && end_date) {
      rangeStart = startOfDay(new Date(start_date + 'T00:00:00'));
      rangeEnd = endOfDay(new Date(end_date + 'T23:59:59'));
    } else {
      rangeStart = startOfDay(today);
      rangeEnd = endOfDay(today);
    }

    const entries = await prisma.vehicleEntry.findMany({
      where: {
        entryTime: { gte: rangeStart, lte: rangeEnd },
        valetClientId, // ISOLAMENTO
      },
      include: {
        vehicle: {
          select: {
            plate: true,
            clientName: true,
            vehicleNumber: true,
          },
        },
      },
      orderBy: { entryTime: 'desc' },
      take: 100,
    });

    const durations = entries
      .filter((entry) => entry.exitTime)
      .map((entry) => (entry.exitTime.getTime() - entry.entryTime.getTime()) / 60000);

    const avgDuration = durations.length
      ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
      : 0;
    const maxDuration = durations.length ? Math.max(...durations) : 0;
    const minDuration = durations.length ? Math.min(...durations) : 0;

    res.json({
      start_date: toDateOnly(rangeStart),
      end_date: toDateOnly(rangeEnd),
      total_vehicles: entries.length,
      avg_duration_minutes: avgDuration,
      max_duration_minutes: Math.round(maxDuration),
      min_duration_minutes: Math.round(minDuration),
      vehicles: entries.map((entry) => ({
        id: entry.id,
        vehicle_number: entry.vehicle?.vehicleNumber,
        plate: entry.vehicle?.plate,
        client_name: entry.vehicle?.clientName,
        entry_time: entry.entryTime,
        exit_time: entry.exitTime,
        status: entry.status,
        duration_minutes: entry.exitTime
          ? Math.round((entry.exitTime.getTime() - entry.entryTime.getTime()) / 60000)
          : null,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter relatório de veículos',
      code: 'VEHICLES_REPORT_ERROR',

      // GET /api/reports/parked-vehicles
      router.get('/parked-vehicles', authorize('admin'), async (req, res) => {
        try {
          const valetClientId = req.user.valetClientId;
    
          if (!valetClientId) {
            return res.status(403).json({
              success: false,
              message: 'Usuário não está associado a um valet',
            });
          }

          const parkedVehicles = await prisma.vehicleEntry.findMany({
            where: {
              status: 'parked',
              valetClientId,
            },
            include: {
              vehicle: {
                select: {
                  plate: true,
                  clientName: true,
                  clientPhone: true,
                  vehicleNumber: true,
                },
              },
            },
            orderBy: { entryTime: 'desc' },
          });

          const now = new Date();
          const vehicles = parkedVehicles.map((entry) => {
            const durationMinutes = Math.round((now.getTime() - entry.entryTime.getTime()) / 60000);
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
      
            return {
              id: entry.id,
              plate: entry.vehicle?.plate || '-',
              client_name: entry.vehicle?.clientName || '-',
              client_phone: entry.vehicle?.clientPhone || '-',
              entry_time: entry.entryTime,
              duration_minutes: durationMinutes,
              duration_formatted: `${hours}h ${minutes}m`,
            };
          });

          res.json({
            total_parked: vehicles.length,
            vehicles,
          });
        } catch (error) {
          res.status(500).json({
            error: 'Erro ao obter veículos no pátio',
            code: 'PARKED_VEHICLES_ERROR',
            message: error.message,
          });
        }
      });
      message: error.message,
    });
  }
});

export default router;
