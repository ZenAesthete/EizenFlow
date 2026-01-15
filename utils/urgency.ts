import { Task } from '../types';

/**
 * Calculates the current urgency score based on the base urgency,
 * when it was set, and the due date.
 */
export const calculateCurrentUrgency = (task: Task): number => {
  if (!task.dueDate) {
    return task.baseUrgency;
  }

  const now = Date.now();
  
  // If overdue, max urgency
  if (now >= task.dueDate) {
    return 100;
  }

  // Time total duration from when urgency was set to due date
  const totalDuration = task.dueDate - task.urgencySetAt;
  
  // If duration is invalid or zero (shouldn't happen ideally), return base
  if (totalDuration <= 0) {
    return 100; 
  }

  const timeElapsed = now - task.urgencySetAt;
  
  // If we somehow went back in time relative to setAt
  if (timeElapsed < 0) return task.baseUrgency;

  // Linear progression fraction (0 to 1)
  const progress = timeElapsed / totalDuration;

  // Determine factor based on curve type
  // Default to linear if undefined (for old data)
  const curve = task.urgencyCurve || 'linear';
  
  let factor = progress;

  if (curve === 'fast') {
    // Fast Ramping (Front-loaded): Concave Down / Ease Out
    // Increases rapidly then saturates
    // Formula: 1 - (1 - p)^3
    factor = 1 - Math.pow(1 - progress, 3);
  } else if (curve === 'slow') {
    // Slow Ramping (Back-loaded): Concave Up / Ease In
    // Increases slowly then shoots up near deadline
    // Formula: p^3
    factor = Math.pow(progress, 3);
  }
  // 'linear' stays as factor = progress

  // Calculate dynamic urgency
  // Start at baseUrgency, reach 100 at due date
  // Formula: U_now = U_start + factor * (100 - U_start)
  const remainingRange = 100 - task.baseUrgency;
  const addedUrgency = factor * remainingRange;

  return Math.min(100, Math.max(0, task.baseUrgency + addedUrgency));
};

/**
 * Returns the Quadrant ID based on importance and urgency
 */
export const getQuadrant = (importance: number, urgency: number) => {
  const isImportant = importance >= 50;
  const isUrgent = urgency >= 50;

  if (isImportant && isUrgent) return 'do';
  if (isImportant && !isUrgent) return 'schedule';
  if (!isImportant && isUrgent) return 'delegate';
  return 'eliminate';
};