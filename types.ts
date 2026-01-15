
export type UrgencyCurve = 'linear' | 'fast' | 'slow';

export interface Task {
  id: string;
  title: string;
  description?: string;
  importance: number; // 0-100
  baseUrgency: number; // 0-100
  impact: number; // 0-100 (New)
  effort: number; // 0-100 (New)
  urgencyCurve: UrgencyCurve; // Defines how urgency increases over time
  urgencySetAt: number; // timestamp
  dueDate: number | null; // timestamp
  completed: boolean;
  createdAt: number;
}

export type QuadrantType = 'do' | 'schedule' | 'delegate' | 'eliminate';

// New type for view navigation
export type MatrixTab = 'matrix' | 'all' | QuadrantType;

export interface QuadrantDef {
  id: QuadrantType;
  label: string;
  description: string;
  color: string;
  bg: string;
  borderColor: string;
  textColor: string;
}

export type SortOptionType = 'default' | 'leverage' | 'balanced' | 'frog' | 'urgent';

export interface SortDefinition {
  id: SortOptionType;
  label: string;
  description: string;
}
