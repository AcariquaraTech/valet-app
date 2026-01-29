import prisma from '../lib/prisma.js';

export const dailyReport = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Total de carros no pátio
    const totalParked = await prisma.vehicleEntry.count({
      where: { status: 'parked' }
    });

    // Entradas do dia
    const entries = await prisma.vehicleEntry.findMany({
      where: {
        entryTime: { gte: startOfDay, lte: endOfDay }
      },
      select: { entryTime: true }
    });

    // Contagem por hora
    const entriesByHour = {};
    entries.forEach(e => {
      const hour = new Date(e.entryTime).getHours();
      entriesByHour[hour] = (entriesByHour[hour] || 0) + 1;
    });

    // Horário de maior movimento
    let peakHour = null;
    let peakCount = 0;
    Object.entries(entriesByHour).forEach(([h, c]) => {
      if (c > peakCount) {
        peakCount = c;
        peakHour = h;
      }
    });

    res.json({
      success: true,
      data: {
        totalParked,
        peakHour,
        entriesByHour
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no relatório', error: error.message });
  }
};
