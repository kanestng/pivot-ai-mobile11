import { GoogleGenAI, Type } from "@google/genai";
import { PivotConfig, AggregatorType } from "../types";

// Declare process to satisfy TypeScript checking in browser environment
declare const process: any;

export const analyzeQuery = async (
  query: string,
  headers: string[],
  currentConfig: PivotConfig
): Promise<{ text: string; config?: PivotConfig }> => {
  // Safe access to API Key injected by Vite
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return { text: "API Key is missing. Please check your environment configuration." };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      explanation: {
        type: Type.STRING,
        description: "A friendly, brief explanation of what you did or the answer to the question."
      },
      updateConfig: {
        type: Type.BOOLEAN,
        description: "Whether the user's request requires updating the pivot table configuration."
      },
      config: {
        type: Type.OBJECT,
        nullable: true,
        properties: {
          rowField: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of field names to group rows by (hierarchical)."
          },
          colField: { type: Type.STRING, nullable: true },
          valueField: { type: Type.STRING },
          aggregator: { type: Type.STRING, enum: Object.values(AggregatorType) }
        }
      }
    },
    required: ["explanation", "updateConfig"]
  };

  const prompt = `
    You are a data analyst helper for a Pivot Table app.
    
    The dataset has the following headers: ${JSON.stringify(headers)}.
    
    The current Pivot Configuration is:
    - Rows (Group hierarchy): ${JSON.stringify(currentConfig.rowField)}
    - Columns: ${currentConfig.colField || 'None'}
    - Values: ${currentConfig.valueField}
    - Aggregator: ${currentConfig.aggregator}

    User Query: "${query}"

    Instructions:
    1. If the user asks to change the view (e.g., "Show sales by region", "Group by unit and item"), generate a new valid configuration.
    2. The 'rowField' must be an array of strings. Order matters (primary group first).
    3. 'colField' is optional (use null if standard table).
    4. Ensure field names match the provided headers EXACTLY. If you are unsure, pick the closest match.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    if (result.updateConfig && result.config) {
        // Validate fields exist
        const safeConfig: PivotConfig = {
            ...currentConfig,
            ...result.config
        };
        
        // Sanity check: Ensure rowFields are valid
        if (safeConfig.rowField) {
             safeConfig.rowField = safeConfig.rowField.filter(f => headers.includes(f));
             // Fallback if all invalid
             if (safeConfig.rowField.length === 0) safeConfig.rowField = currentConfig.rowField;
        }

        if (safeConfig.colField && !headers.includes(safeConfig.colField)) safeConfig.colField = undefined;
        if (!headers.includes(safeConfig.valueField)) safeConfig.valueField = currentConfig.valueField;

        return { text: result.explanation, config: safeConfig };
    }

    return { text: result.explanation };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I'm sorry, I encountered an error while processing your request with Gemini." };
  }
};