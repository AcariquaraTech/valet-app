import express from 'express';
import { recognizePlateFromBase64 } from '../services/ocrService.js';

const router = express.Router();

// POST /api/ocr/recognize-plate
router.post('/recognize-plate', async (req, res) => {
  try {
    const { image_base64 } = req.body;

    if (!image_base64) {
      return res.status(400).json({
        error: 'Imagem em base64 é obrigatória',
        code: 'MISSING_IMAGE',
      });
    }

    const result = await recognizePlateFromBase64(image_base64);

    if (result.success) {
      res.json({
        plate: result.plate,
        confidence: result.confidence,
        raw_text: result.rawText,
        recognized_at: new Date().toISOString(),
      });
    } else {
      res.status(400).json({
        error: result.error,
        code: 'PLATE_NOT_RECOGNIZED',
        detected_text: result.detectedText,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao processar imagem',
      code: 'OCR_ERROR',
      message: error.message,
    });
  }
});

// POST /api/ocr/quick-entry
router.post('/quick-entry', async (req, res) => {
  try {
    const { plate, image_base64, client_name, client_phone } = req.body;

    if (!plate) {
      return res.status(400).json({
        error: 'Placa é obrigatória',
        code: 'MISSING_PLATE',
      });
    }

    const vehicle = {
      id: `vehicle-${Date.now()}`,
      company_id: req.user.companyId,
      plate: plate.toUpperCase(),
      entry_time: new Date().toISOString(),
      status: 'parked',
      client_name: client_name || null,
      client_phone: client_phone || null,
    };

    res.status(201).json({
      id: vehicle.id,
      plate: vehicle.plate,
      entry_time: vehicle.entry_time,
      status: vehicle.status,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao criar entrada rápida',
      code: 'QUICK_ENTRY_ERROR',
      message: error.message,
    });
  }
});

export default router;
