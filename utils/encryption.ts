import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

// IMPORTANT: This key MUST match the one used in the backend
// In production, this should be fetched from a secure source
const DEFAULT_ENCRYPTION_KEY = 'afritix-secure-key';

/**
 * Generate a secure random ID that follows the UUID format
 * This is a fallback for platforms where crypto.randomUUID is not available
 */
export function generateSecureId(): string {
  try {
    // Try to use native crypto if available
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    
    // Generate random hex strings for each section of the UUID
    const p1 = CryptoJS.lib.WordArray.random(4).toString(CryptoJS.enc.Hex);
    const p2 = CryptoJS.lib.WordArray.random(2).toString(CryptoJS.enc.Hex);
    const p3 = CryptoJS.lib.WordArray.random(2).toString(CryptoJS.enc.Hex);
    const p4 = CryptoJS.lib.WordArray.random(2).toString(CryptoJS.enc.Hex);
    const p5 = CryptoJS.lib.WordArray.random(6).toString(CryptoJS.enc.Hex);
    
    // Format according to UUID v4 standard
    return `${p1}-${p2}-${p3}-${p4}-${p5}`;
  } catch (error) {
    console.warn('CryptoJS random generation failed, using fallback:', error);
    
    // Fallback to simple Math.random if CryptoJS fails
    // Still formatted as a UUID
    const hexDigits = '0123456789abcdef';
    let uuid = '';
    
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else if (i === 14) {
        uuid += '4'; // Version 4 UUID
      } else if (i === 19) {
        uuid += hexDigits[(Math.random() * 4) | 8]; // Variant bits
      } else {
        uuid += hexDigits[(Math.random() * 16) | 0];
      }
    }
    
    return uuid;
  }
}

/**
 * Generate a secure random bytes array using CryptoJS
 * This is a fallback for platforms where crypto.getRandomValues is not available
 */
export function getRandomBytes(length: number): string {
  try {
    // Try to use CryptoJS for random generation (works on all platforms)
    return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.warn('CryptoJS random generation failed, using fallback:', error);
    // Fallback to simple Math.random if CryptoJS fails
    let result = '';
    const characters = 'abcdef0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length * 2; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

/**
 * Generate a proper UUID v4 string
 * This is used for database IDs and should be compatible with PostgreSQL UUID type
 */
export function generateUUID(): string {
  try {
    // Try to use native crypto if available
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    
    // Use CryptoJS to generate a proper UUID v4
    const bytes = CryptoJS.lib.WordArray.random(16);
    
    // Set version bits (4) and variant bits (8, 9, A, or B)
    bytes.words[4] = ((bytes.words[4] & 0x0fff) | 0x4000);  // version 4
    bytes.words[6] = ((bytes.words[6] & 0x3fff) | 0x8000);  // variant 1
    
    const hexString = bytes.toString(CryptoJS.enc.Hex);
    
    // Format as UUID
    return [
      hexString.substring(0, 8),
      hexString.substring(8, 12),
      hexString.substring(12, 16),
      hexString.substring(16, 20),
      hexString.substring(20, 32)
    ].join('-');
  } catch (error) {
    console.warn('UUID generation failed, using fallback:', error);
    
    // Fallback to a simpler UUID generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Génère une chaîne de données QR code sécurisée pour un billet
 * EXACT MATCH to web implementation
 * @param ticketId L'ID du billet
 * @returns Données QR code chiffrées
 */
export function generateQRCodeData(ticketId: string): string {
  try {
    // Create a standardized data object that matches the web version
    const data = {
      id: ticketId,
      timestamp: Date.now(),
      type: 'ticket',
      version: '1.0'
    };
    
    // Convert to string in a consistent format
    const dataString = JSON.stringify(data);
    
    // Use the same encryption key and method as web version
    const secretKey = DEFAULT_ENCRYPTION_KEY;
    
    try {
      // Use consistent encryption settings
      const encrypted = CryptoJS.AES.encrypt(dataString, secretKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
      
      // Format the final QR code data exactly like web version
      return `AFX1:${encrypted}`;
    } catch (encryptError) {
      console.error('AES encryption failed:', encryptError);
      // Use the same fallback format as web version
      return `AFX0:${ticketId}:${Date.now()}`;
    }
  } catch (error) {
    console.error('Error generating QR code data:', error);
    // Use the same fallback format as web version
    return `AFX0:${ticketId}:${Date.now()}`;
  }
}

/**
 * Décode et valide un code QR
 * Matches web implementation exactly
 */
export function decodeQRData(qrData: string): { id: string; timestamp: number } | null {
  try {
    // Check for prefix to determine format
    if (qrData.startsWith('AFX1:')) {
      // Encrypted format
      const encrypted = qrData.substring(5); // Remove 'AFX1:' prefix
      const secretKey = DEFAULT_ENCRYPTION_KEY;
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);
      
      const data = JSON.parse(decrypted);
      
      // Validate the data format
      if (!data.id || !data.timestamp || data.type !== 'ticket' || data.version !== '1.0') {
        return null;
      }
      
      // Verify timestamp (60 seconds validity)
      const now = Date.now();
      if (now - data.timestamp > 60000) {
        return null;
      }
      
      return {
        id: data.id,
        timestamp: data.timestamp
      };
    } else if (qrData.startsWith('AFX0:')) {
      // Fallback format
      const parts = qrData.split(':');
      if (parts.length !== 3) return null;
      
      const id = parts[1];
      const timestamp = parseInt(parts[2], 10);
      
      // Verify timestamp (60 seconds validity)
      const now = Date.now();
      if (now - timestamp > 60000) {
        return null;
      }
      
      return { id, timestamp };
    }
    
    return null;
  } catch (error) {
    console.error('Error decoding QR data:', error);
    return null;
  }
}

/**
 * Verify QR code data - EXACTLY matching web implementation
 */
export const verifyQRCodeData = (encryptedData: string): boolean => {
  try {
    const decodedData = decodeQRData(encryptedData);
    return decodedData !== null;
  } catch (error) {
    console.error('QR code verification error:', error);
    return false;
  }
};