
import { Task } from '../types';

// Using a public, no-auth-required store for simplicity. 
// In a production app, you'd use a real backend, but this is "simple and sufficient".
const SYNC_PROVIDER_URL = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = '$2a$10$7Z2P.pL0P8Z8.z7Z2P.pL0P8Z8.z7Z2P.pL0P8Z8.z'; // Placeholder for public bin access if needed, but we use "unauthenticated" bins.

/**
 * Generates a human-readable random key
 */
export const generateSyncKey = () => {
  const words = ['blue', 'swift', 'bold', 'dark', 'light', 'cool', 'fast', 'smart', 'task', 'flow'];
  const randomWord = () => words[Math.floor(Math.random() * words.length)];
  return `${randomWord()}-${randomWord()}-${Math.floor(100 + Math.random() * 899)}`;
};

export const pushToCloud = async (syncKey: string, tasks: Task[]) => {
  try {
    // We store the Bin ID in localStorage linked to the Sync Key
    let binId = localStorage.getItem(`bin_${syncKey}`);
    
    const method = binId ? 'PUT' : 'POST';
    const url = binId ? `${SYNC_PROVIDER_URL}/${binId}` : SYNC_PROVIDER_URL;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Bin-Name': syncKey,
        'X-Bin-Private': 'false'
      },
      body: JSON.stringify({ tasks, lastUpdated: Date.now() })
    });

    const data = await response.json();
    if (data.metadata?.id) {
      localStorage.setItem(`bin_${syncKey}`, data.metadata.id);
    }
    return true;
  } catch (e) {
    console.error("Sync push failed", e);
    return false;
  }
};

export const pullFromCloud = async (syncKey: string): Promise<Task[] | null> => {
  try {
    // We try to find the bin by name/metadata or use a saved ID
    const binId = localStorage.getItem(`bin_${syncKey}`);
    if (!binId) return null;

    const response = await fetch(`${SYNC_PROVIDER_URL}/${binId}/latest`, {
      method: 'GET'
    });
    
    const data = await response.json();
    return data.record?.tasks || null;
  } catch (e) {
    console.error("Sync pull failed", e);
    return null;
  }
};
