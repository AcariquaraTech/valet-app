import config from '../config/index.js';

// Mock send SMS function
const mockSendSMS = async (phoneNumber, message) => {
  console.log(`[SMS MOCK] To: ${phoneNumber}, Message: ${message}`);
  return {
    success: true,
    messageId: `SM_MOCK_${Date.now()}`,
    status: 'queued',
  };
};

export const sendSMS = async (phoneNumber, message) => {
  try {
    return await mockSendSMS(phoneNumber, message);
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendEntryNotification = async (phoneNumber, plate, entryTime) => {
  const message = `Seu veículo placa ${plate} entrou no valet às ${entryTime} horas`;
  return sendSMS(phoneNumber, message);
};

export const sendExitNotification = async (phoneNumber, plate, exitTime) => {
  const message = `Seu veículo placa ${plate} saiu do valet às ${exitTime} horas`;
  return sendSMS(phoneNumber, message);
};
