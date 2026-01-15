
import { Task } from '../types';
import { calculateCurrentUrgency } from './urgency';

/**
 * Sorting Strategy 1: Smart Eisenhower (Default)
 * Sorts primarily by calculated Urgency + Importance.
 * This is the classic behavior.
 */
export const scoreDefault = (task: Task): number => {
  const urgency = calculateCurrentUrgency(task);
  return urgency + task.importance;
};

/**
 * Sorting Strategy 2: Impact Density (Leverage / ROI)
 * Formula: Impact / (Effort + 10)
 * Focuses on Quick Wins: High Impact, Low Effort.
 */
export const scoreLeverage = (task: Task): number => {
  const impact = task.impact ?? 50;
  const effort = task.effort ?? 50;
  // Denominator offset to prevent division by zero and extreme skew for 0 effort
  return impact / (effort + 10);
};

/**
 * Sorting Strategy 3: Balanced Score (WSJF-inspired)
 * Formula: ((0.55*Im + 0.45*Ip) * (1 + (U/100)^2)) / (E + 10)
 * Considers all 4 factors with urgency as a multiplier.
 */
export const scoreBalanced = (task: Task): number => {
  const urgency = calculateCurrentUrgency(task);
  const importance = task.importance;
  const impact = task.impact ?? 50;
  const effort = task.effort ?? 50;

  const value = (0.55 * importance) + (0.45 * impact);
  const urgencyMultiplier = 1 + Math.pow(urgency / 100, 2);
  
  return (value * urgencyMultiplier) / (effort + 10);
};

/**
 * Sorting Strategy 4: Eat the Frog
 * Focuses on High Effort + High Importance.
 * Use this when you have energy and need to tackle the beast.
 */
export const scoreFrog = (task: Task): number => {
  const effort = task.effort ?? 50;
  // We want High Effort AND High Importance to be at the top.
  // We normalize to ensure effort doesn't drown out importance.
  return (effort * 0.6) + (task.importance * 0.4);
};

/**
 * Sorting Strategy 5: Urgency Only
 * Strict deadline adherence.
 */
export const scoreUrgency = (task: Task): number => {
  return calculateCurrentUrgency(task);
};
