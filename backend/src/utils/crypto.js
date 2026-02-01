import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateAccessKeyCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 15; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `VALET-${result}`;
};
