import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  keySize: number;
  ivSize: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  tag?: string; // For GCM mode
  algorithm: string;
}

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly DEFAULT_ALGORITHM = 'AES-256-CBC';
  private readonly KEY_SIZE = 256;
  private readonly IV_SIZE = 128;

  /**
   * Generate encryption key from user password or master key
   */
  generateKey(password: string, salt?: string): string {
    const saltToUse = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    return CryptoJS.PBKDF2(password, saltToUse, {
      keySize: this.KEY_SIZE / 32,
      iterations: 10000
    }).toString();
  }

  /**
   * Encrypt data with end-to-end encryption
   */
  encrypt(data: string | object, key: string): EncryptedData {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const keyWordArray = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(this.IV_SIZE / 8);

    const encrypted = CryptoJS.AES.encrypt(dataString, keyWordArray, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return {
      data: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
      iv: iv.toString(CryptoJS.enc.Base64),
      algorithm: this.DEFAULT_ALGORITHM
    };
  }

  /**
   * Decrypt end-to-end encrypted data
   */
  decrypt(encryptedData: EncryptedData, key: string): string {
    const keyWordArray = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.enc.Base64.parse(encryptedData.iv);
    const ciphertext = CryptoJS.enc.Base64.parse(encryptedData.data);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any,
      keyWordArray,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Encrypt transaction data
   */
  encryptTransaction(transaction: {
    amount: number;
    currency: string;
    recipient?: string;
    reference?: string;
    metadata?: any;
  }, userKey: string): EncryptedData {
    return this.encrypt(transaction, userKey);
  }

  /**
   * Hash sensitive data (one-way encryption)
   */
  hash(data: string, salt?: string): string {
    const saltToUse = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    return CryptoJS.PBKDF2(data, saltToUse, {
      keySize: 512 / 32,
      iterations: 10000
    }).toString();
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * Encrypt file data
   */
  encryptFile(fileData: string | ArrayBuffer, key: string): EncryptedData {
    const dataString = typeof fileData === 'string' 
      ? fileData 
      : this.arrayBufferToBase64(fileData);
    return this.encrypt(dataString, key);
  }

  /**
   * Verify data integrity
   */
  verifyIntegrity(data: string, hash: string): boolean {
    const computedHash = CryptoJS.SHA256(data).toString();
    return computedHash === hash;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}


