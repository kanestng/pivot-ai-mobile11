import { DataRow, PivotConfig, AggregatorType, PivotResult } from '../types';

// Robust CSV Parser
export const parseCSV = (content: string): DataRow[] => {
  const lines = content.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  // Helper to split CSV line respecting quotes
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuote = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        // Toggle quote state
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current); // Last field
    return result;
  };

  const headers = splitLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
  const data: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const safeValues = splitLine(lines[i]);

    if (safeValues.length === headers.length) {
      const row: DataRow = {};
      headers.forEach((header, index) => {
        let val = safeValues[index] ? safeValues[index].trim() : '';
        
        // Remove wrapping quotes if present
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }

        // Clean formatting for number detection (remove $ and ,)
        const cleanVal = val.replace(/[$,\s]/g, '');
        
        // Try convert to number
        const num = parseFloat(cleanVal);
        
        if (!isNaN(num) && cleanVal !== '' && isFinite(num)) {
            row[header] = num;
        } else {
            row[header] = val; // Keep as string
        }
      });
      data.push(row);
    }
  }
  return data;
};

// Pivot Logic
export const calculatePivot = (data: DataRow[], config: PivotConfig): PivotResult => {
  const { rowField, colField, valueField, aggregator } = config;
  
  const rowKeysSet = new Set<string>();
  const colKeysSet = new Set<string>();
  const valuesMap: Record<string, Record<string, number[]>> = {};

  // 1. Group Data
  data.forEach(row => {
    // Generate composite key from multiple row fields
    let rKey = 'Total';
    if (rowField && rowField.length > 0) {
        rKey = rowField.map(field => String(row[field] ?? 'Unassigned')).join(' - ');
    }

    const cKey = colField ? String(row[colField] || 'Total') : 'Total';
    
    rowKeysSet.add(rKey);
    colKeysSet.add(cKey);

    if (!valuesMap[rKey]) valuesMap[rKey] = {};
    if (!valuesMap[rKey][cKey]) valuesMap[rKey][cKey] = [];

    const val = Number(row[valueField]);
    if (!isNaN(val)) {
      valuesMap[rKey][cKey].push(val);
    }
  });

  // 2. Aggregate
  const matrix: Record<string, Record<string, number>> = {};
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  let grandTotal = 0;

  const sortedRowKeys = Array.from(rowKeysSet).sort();
  const sortedColKeys = Array.from(colKeysSet).sort();

  // Helper for aggregation
  const aggregate = (nums: number[]): number => {
    if (nums.length === 0) return 0;
    switch (aggregator) {
      case AggregatorType.SUM: return nums.reduce((a, b) => a + b, 0);
      case AggregatorType.COUNT: return nums.length;
      case AggregatorType.AVERAGE: return nums.reduce((a, b) => a + b, 0) / nums.length;
      case AggregatorType.MIN: return Math.min(...nums);
      case AggregatorType.MAX: return Math.max(...nums);
      default: return 0;
    }
  };

  // Grand totals collection for Average aggregation
  const allValues: number[] = [];

  sortedRowKeys.forEach(rKey => {
    matrix[rKey] = {};
    const rowValues: number[] = []; // for row total aggregation

    sortedColKeys.forEach(cKey => {
      const nums = valuesMap[rKey]?.[cKey] || [];
      const val = aggregate(nums);
      matrix[rKey][cKey] = val;

      if (nums.length > 0) {
        rowValues.push(...nums);
        if (!colTotals[cKey]) colTotals[cKey] = 0; 
      }
    });

    // Compute Row Total
    rowTotals[rKey] = aggregate(rowValues);
    allValues.push(...rowValues);
  });

  // Compute Col Totals
  sortedColKeys.forEach(cKey => {
    const colValues: number[] = [];
    sortedRowKeys.forEach(rKey => {
       const nums = valuesMap[rKey]?.[cKey] || [];
       colValues.push(...nums);
    });
    colTotals[cKey] = aggregate(colValues);
  });

  grandTotal = aggregate(allValues);

  return {
    rowKeys: sortedRowKeys,
    colKeys: sortedColKeys,
    matrix,
    rowTotals,
    colTotals,
    grandTotal
  };
};

export const pivotResultToCSV = (result: PivotResult, rowLabel: string, colLabel: string): string => {
  // Header
  const header = [`"${rowLabel} / ${colLabel}"`, ...result.colKeys, "Row Total"].map(c => `"${c}"`).join(',');
  
  // Rows
  const rows = result.rowKeys.map(rKey => {
    const values = result.colKeys.map(cKey => result.matrix[rKey][cKey] ?? 0);
    const total = result.rowTotals[rKey] ?? 0;
    const safeKey = rKey.replace(/"/g, '""');
    return [`"${safeKey}"`, ...values, total].join(',');
  });

  // Grand Total
  const grandTotalValues = result.colKeys.map(cKey => result.colTotals[cKey] ?? 0);
  const grandTotalRow = ["Grand Total", ...grandTotalValues, result.grandTotal].join(',');

  return [header, ...rows, grandTotalRow].join('\n');
};