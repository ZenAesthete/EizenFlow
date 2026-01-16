
import { Task } from '../types';
import LZString from 'lz-string';

const PREFIX = 'EISENFLOW:';

/**
 * Compresses tasks into a string suitable for a QR code.
 */
export const generateSyncCode = (tasks: Task[]): string => {
  try {
    const jsonString = JSON.stringify(tasks);
    // Use compressToEncodedURIComponent for URL/QR safe characters
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return `${PREFIX}${compressed}`;
  } catch (e) {
    console.error('Compression failed', e);
    return '';
  }
};

/**
 * Decompresses a QR code string back into tasks.
 * Returns null if invalid.
 */
export const parseSyncCode = (code: string): Task[] | null => {
  try {
    if (!code.startsWith(PREFIX)) return null;
    
    const compressed = code.slice(PREFIX.length);
    const jsonString = LZString.decompressFromEncodedURIComponent(compressed);
    
    if (!jsonString) return null;
    
    const tasks = JSON.parse(jsonString);
    
    // Basic validation
    if (!Array.isArray(tasks)) return null;
    
    return tasks;
  } catch (e) {
    console.error('Decompression failed', e);
    return null;
  }
};
