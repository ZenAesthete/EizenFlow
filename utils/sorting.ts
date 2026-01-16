
import { Task } from '../types';
import { calculateCurrentUrgency, getQuadrant } from './urgency';

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
 * 
 * Includes Quadrant Multipliers to prevent "Urgency Addiction":
 * Q1 (Do): x1.15
 * Q2 (Schedule): x1.10 (Boosts strategic work)
 * Q3 (Delegate): x0.85 (Deprioritizes noise)
 * Q4 (Eliminate): x0.60
 */
export const scoreBalanced = (task: Task): number => {
  const urgency = calculateCurrentUrgency(task);
  const importance = task.importance;
  const impact = task.impact ?? 50;
  const effort = task.effort ?? 50;

  // 1. Base WSJF Score (Weighted Shortest Job First)
  // Numerator: Cost of Delay (Value + Urgency Multiplier)
  // Denominator: Job Size (Effort)
  const value = (0.55 * importance) + (0.45 * impact);
  const urgencyMultiplier = 1 + Math.pow(urgency / 100, 2);
  const baseScore = (value * urgencyMultiplier) / (effort + 10);

  // 2. Quadrant Multiplier
  // Ensures strategic (Q2) tasks remain visible against urgent noise (Q3)
  const quadrant = getQuadrant(importance, urgency);
  let multiplier = 1.0;
  
  switch (quadrant) {
    case 'do': multiplier = 1.15; break;        // Urgent & Important
    case 'schedule': multiplier = 1.10; break;  // Not Urgent & Important (Strategic)
    case 'delegate': multiplier = 0.85; break;  // Urgent & Not Important (Distraction)
    case 'eliminate': multiplier = 0.60; break; // Neither
  }

  return baseScore * multiplier;
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
