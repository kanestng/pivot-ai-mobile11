export type DataRow = Record<string, string | number | null>;

export enum AggregatorType {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  MIN = 'MIN',
  MAX = 'MAX'
}

export interface PivotConfig {
  rowField: string[];
  colField?: string;
  valueField: string;
  aggregator: AggregatorType;
}

export interface PivotResult {
  rowKeys: string[];
  colKeys: string[];
  matrix: Record<string, Record<string, number>>;
  rowTotals: Record<string, number>;
  colTotals: Record<string, number>;
  grandTotal: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isThinking?: boolean;
}