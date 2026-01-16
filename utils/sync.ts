
import { Task } from '../types';

// Using JSONBlob for free, no-auth syncing.
const SYNC_PROVIDER_URL = 'https://jsonblob.com/api/jsonBlob';

export const pushToCloud = async (currentId: string | null, tasks: Task[]): Promise<string | null> => {
  try {
    const payload = JSON.stringify({ tasks, lastUpdated: Date.now() });
    
    // Helper to perform the request
    const doRequest = async (id: string | null) => {
        const method = id ? 'PUT' : 'POST';
        // Ensure ID is encoded if it came from legacy data containing special chars
        const url = id ? `${SYNC_PROVIDER_URL}/${encodeURIComponent(id)}` : SYNC_PROVIDER_URL;
        
        return fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: payload
        });
    };

    // 1. If we have an existing ID, try to update it (PUT)
    if (currentId) {
        try {
            const response = await doRequest(currentId);
            
            if (response.ok) {
                return currentId;
            }
            
            // If the server returns 404, the ID is invalid/expired.
            // If it returns 405/400, it might be a bad request.
            // In these cases, we should proceed to create a NEW blob to restore sync functionality.
            if (response.status === 404 || response.status === 400) {
                 console.warn(`Sync ID ${currentId} invalid (Status ${response.status}). Creating new blob.`);
            } else {
                 // For other server errors (5xx), we probably shouldn't create a new one immediately as it might be temporary.
                 throw new Error(`Sync update failed: ${response.status} ${response.statusText}`);
            }
        } catch (e) {
            // If fetch throws (e.g., TypeError: Failed to fetch), it could be CORS or a network issue.
            // However, it could also be a malformed URL from a legacy ID.
            // We'll log it and attempt to fall back to POST as a recovery mechanism.
            console.warn("Sync update failed (Network/CORS?), attempting fallback to new blob.", e);
        }
    }

    // 2. Create New Blob (POST)
    // Reached if: currentId is null, OR PUT returned 404/400, OR PUT threw network error (fallback)
    const response = await doRequest(null);

    if (!response.ok) {
        throw new Error(`Sync create failed: ${response.statusText}`);
    }

    const location = response.headers.get('Location');
    if (location) {
        // Extract the UUID from the end of the URL
        const newId = location.split('/').pop();
        return newId || null;
    }
    
    return null;

  } catch (e) {
    console.error("Sync push failed", e);
    return null;
  }
};

export const pullFromCloud = async (syncId: string): Promise<Task[] | null> => {
  try {
    if (!syncId) return null;
    
    const response = await fetch(`${SYNC_PROVIDER_URL}/${encodeURIComponent(syncId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) return null;

    const data = await response.json();
    return data.tasks || null;
  } catch (e) {
    console.error("Sync pull failed", e);
    return null;
  }
};
