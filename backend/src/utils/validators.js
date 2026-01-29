export const validatePlate = (plate) => {
  // Formato: ABC-1234 ou ABCD-1234 (novo padrão)
  const oldFormat = /^[A-Z]{3}-\d{4}$/;
  const newFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return oldFormat.test(plate) || newFormat.test(plate.replace('-', ''));
};


export const validatePhoneNumber = (phone) => {
  // Remove caracteres especiais
  const cleaned = phone.replace(/\D/g, '');
  // Valida se tem entre 10 e 11 dígitos
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const validateCNPJCPF = (cnpjCpf) => {
  const cleaned = cnpjCpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    // CPF validation
    return validateCPF(cleaned);
  } else if (cleaned.length === 14) {
    // CNPJ validation
    return validateCNPJ(cleaned);
  }
  
  return false;
};

const validateCPF = (cpf) => {
  if (cpf === cpf[0].repeat(11)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10), 10)) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11), 10)) return false;
  
  return true;
};

const validateCNPJ = (cnpj) => {
  if (cnpj === cnpj[0].repeat(14)) return false;
  
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0), 10)) return false;
  
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1), 10)) return false;
  
  return true;
};

export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  } else if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }
  return phone;
};

export const formatCNPJCPF = (cnpjCpf) => {
  const cleaned = cnpjCpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    // CPF: 000.000.000-00
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9)}`;
  } else if (cleaned.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(5, 8)}/${cleaned.substring(8, 12)}-${cleaned.substring(12)}`;
  }
  
  return cnpjCpf;
};
