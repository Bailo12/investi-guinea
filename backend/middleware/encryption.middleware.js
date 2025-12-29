import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars';

export const encryptData = (data) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    throw new Error('Encryption failed');
  }
};

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed');
  }
};

export const encryptTransaction = (req, res, next) => {
  if (req.body.encrypted && req.body.data) {
    try {
      req.body = decryptData(req.body.data);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid encrypted data' });
    }
  }
  next();
};


