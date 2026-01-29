import { Linking } from 'react-native';

/**
 * Abre o app de SMS do dispositivo já com o número e mensagem preenchidos.
 * @param {string} phone - Número do destinatário (ex: +5511999999999)
 * @param {string} message - Mensagem a ser enviada
 */
export function openSmsApp(phone, message) {
  if (!phone || !message) {
    console.warn('SMS não enviado: telefone ou mensagem ausentes', { phone, message });
    return;
  }
  // Forçar formato internacional (adiciona +55 se não tiver)
  let formattedPhone = phone.trim();
  if (!formattedPhone.startsWith('+')) {
    if (formattedPhone.length === 11) {
      formattedPhone = '+55' + formattedPhone;
    } else {
      console.warn('Telefone pode estar em formato inválido para SMS:', formattedPhone);
    }
  }
  const url = `sms:${formattedPhone}?body=${encodeURIComponent(message)}`;
  console.log('Abrindo app de SMS:', url);
  Linking.openURL(url).catch(err => {
    console.warn('Não foi possível abrir o app de SMS:', err);
  });
}
