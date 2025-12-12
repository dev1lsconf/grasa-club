import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (prompt: string, inventoryContext: Product[]) => {
  try {
    const inventoryString = inventoryContext.map(p => 
      `${p.name} (${p.type}, ${p.strainType || 'N/A'}): ${p.description}. Stock: ${p.stockGrams}g, Precio: €${p.pricePerGram}/g`
    ).join('\n');

    const systemInstruction = `Eres un experto "Budtender" y gestor de inventario para una Asociación Cannábica de alta gama. 
    Tu tono es profesional, conocedor y servicial.
    Tienes acceso al inventario actual:
    ${inventoryString}
    
    Responde preguntas sobre cepas, efectos, beneficios medicinales o ayuda a redactar descripciones de marketing.
    Si te preguntan sobre el stock, consulta el inventario proporcionado.
    Responde siempre en Español y sé conciso.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lo siento, tengo problemas para conectar con el servicio de IA en este momento.";
  }
};
