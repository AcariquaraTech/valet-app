/**
 * Formata uma data local para o formato YYYY-MM-DD sem conversão de timezone
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data no formato YYYY-MM-DD
 */
export const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtém a data local de hoje no formato YYYY-MM-DD
 * @returns {string} Data de hoje no formato YYYY-MM-DD
 */
export const getTodayLocal = () => {
  return formatDateLocal(new Date());
};

/**
 * Obtém uma data no passado no formato YYYY-MM-DD
 * @param {number} daysAgo - Número de dias atrás
 * @returns {string} Data no formato YYYY-MM-DD
 */
export const getDateDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDateLocal(date);
};
