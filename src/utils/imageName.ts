import { randomBytes } from 'crypto';

export const randomImageName = (byte = 32) =>
  randomBytes(byte).toString('hex') + Date.now() + '.jpg';
