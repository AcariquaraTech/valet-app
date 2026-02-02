import prisma from '../lib/prisma.js';
import { recognizePlateFromBase64 } from '../services/ocrService.js';
import { sendSMS } from '../services/smsService.js';

// Register vehicle entry
export const registerEntry = async (req, res) => {
  try {
    // Aceita ambos: snake_case (client_name) e camelCase (clientName)
    const {
      plate,
      model,
      color,
      year,
      clientName = req.body.client_name,
      clientPhone = req.body.client_phone,
      spotNumber = req.body.spot_number,
      observations = req.body.observation,
    } = req.body;
    const operatorId = req.user.id;

    // Validar plate
    if (!plate) {
      return res.status(400).json({
        success: false,
        message: 'Placa do veículo é obrigatória',
      });
    }

    // Check if vehicle exists
    let vehicle = await prisma.vehicle.findUnique({
      where: { plate },
    });

    // Se o veículo existe, verifica se já tem uma entrada ativa (não saída)
    if (vehicle) {
      const activeEntry = await prisma.vehicleEntry.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: 'parked',
        },
      });
      if (activeEntry) {
        return res.status(400).json({
          success: false,
          message: `Veículo ${plate} já possui uma entrada ativa no sistema. Registre a saída antes de fazer uma nova entrada.`,
        });
      }
    }

    // If vehicle doesn't exist, create it with the operator as client
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          plate,
          model,
          color,
          year,
          clientId: operatorId, // Using operator as temporary client
        },
      });
    }

    // Create vehicle entry
    const entry = await prisma.vehicleEntry.create({
      data: {
        vehicleId: vehicle.id,
        operatorId,
        spotNumber,
        observations,
        status: 'parked',
      },
      include: {
        vehicle: true,
        operator: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

    // Send SMS notification if phone provided
    if (clientPhone) {
      await sendSMS(
        clientPhone,
        `Seu veículo placa ${plate} entrou no estacionamento às ${new Date().toLocaleTimeString('pt-BR')}`
      );
    }

    res.status(201).json({
      success: true,
      message: 'Entrada registrada com sucesso',
      data: { entry },
    });
  } catch (error) {
    console.error('Error in registerEntry:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar entrada',
      error: error.message,
    });
  }
};

// Register vehicle exit
export const registerExit = async (req, res) => {
  try {
    const { entryId, totalPrice } = req.body;

    // Find entry
    const entry = await prisma.vehicleEntry.findUnique({
      where: { id: entryId },
      include: {
        vehicle: true,
      },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada não encontrada',
      });
    }

    if (entry.status !== 'parked') {
      return res.status(400).json({
        success: false,
        message: 'Veículo já saiu do estacionamento',
      });
    }

    // Update entry with exit information
    const updatedEntry = await prisma.vehicleEntry.update({
      where: { id: entryId },
      data: {
        exitTime: new Date(),
        totalPrice,
        status: 'retrieved',
      },
      include: {
        vehicle: true,
        operator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Enviar SMS para o cliente na saída, se houver telefone
    const clientPhone = updatedEntry.vehicle?.clientPhone || updatedEntry.vehicle?.client_phone || null;
    const plate = updatedEntry.vehicle?.plate;
    if (clientPhone) {
      await sendSMS(
        clientPhone,
        `Seu veículo placa ${plate} saiu do estacionamento às ${new Date().toLocaleTimeString('pt-BR')}`
      );
    }

    res.json({
      success: true,
      message: 'Saída registrada com sucesso',
      data: { entry: updatedEntry },
    });
  } catch (error) {
    console.error('Error in registerExit:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar saída',
      error: error.message,
    });
  }
};

// List parked vehicles
export const listParkedVehicles = async (req, res) => {
  try {
    const entries = await prisma.vehicleEntry.findMany({
      where: {
        status: 'parked',
      },
      include: {
        vehicle: true,
        operator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        entryTime: 'desc',
      },
    });

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('Error in listParkedVehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar veículos',
      error: error.message,
    });
  }
};

// Get vehicle entry details by ID
export const getVehicleEntryDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.vehicleEntry.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        operator: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada não encontrada',
      });
    }

    res.json({
      success: true,
      data: { entry },
    });
  } catch (error) {
    console.error('Error in getVehicleEntryDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes da entrada',
      error: error.message,
    });
  }
};

// Get vehicle history
export const getVehicleHistory = async (req, res) => {
  try {
    const { plate } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { plate },
      include: {
        entries: {
          include: {
            operator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            entryTime: 'desc',
          },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado',
      });
    }

    res.json({
      success: true,
      data: { vehicle },
    });
  } catch (error) {
    console.error('Error in getVehicleHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico',
      error: error.message,
    });
  }
};

// Recognize plate with OCR
export const recognizePlate = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Imagem não fornecida',
      });
    }

    const ocrResult = await recognizePlateFromBase64(imageBase64);

    // Save OCR scan
    await prisma.ocrScan.create({
      data: {
        plate: ocrResult.plate || 'UNKNOWN',
        confidence: ocrResult.confidence || 0,
        rawText: ocrResult.rawText,
        success: ocrResult.success,
      },
    });

    res.json({
      success: true,
      data: ocrResult,
    });
  } catch (error) {
    console.error('Error in recognizePlate:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reconhecer placa',
      error: error.message,
    });
  }
};
