import express from 'express';

const router = express.Router();

// GET /api/sms/logs
router.get('/logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || null;

    res.json({
      data: [
        {
          id: 'sms-1',
          phone_number: '11987654321',
          message: 'Seu veículo placa ABC-1234 entrou no valet às 14:30 horas',
          message_type: 'entry',
          status: 'sent',
          sent_at: new Date().toISOString(),
        },
      ],
      total: 120,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter logs de SMS',
      code: 'SMS_LOGS_ERROR',
      message: error.message,
    });
  }
});

// POST /api/sms/resend/:smsId
router.post('/resend/:smsId', async (req, res) => {
  try {
    res.json({
      message: 'SMS reenviado com sucesso',
      status: 'sent',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao reenviar SMS',
      code: 'SMS_RESEND_ERROR',
      message: error.message,
    });
  }
});

export default router;
