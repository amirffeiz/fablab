import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Category } from '../types';

// Ensure API key is present
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeItemText = async (text: string): Promise<any> => {
  if (!API_KEY) throw new Error("API Key manquante");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyse le texte suivant décrivant un objet de FabLab et extrais les informations structurées. 
      Le texte est: "${text}".
      Déduis la catégorie la plus appropriée parmi: Électronique, Librairie / Documentation, Consommables 3D/CNC, Outillage, Matières Premières, Mobilier, Autre.
      Suggère une quantité minimale de stock logique.
      Suggère un emplacement de stockage typique dans un FabLab.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nom court et précis de l'objet" },
            description: { type: Type.STRING, description: "Description technique" },
            category: { type: Type.STRING, enum: Object.values(Category) },
            suggestedQuantity: { type: Type.NUMBER, description: "Quantité détectée ou 1 par défaut" },
            suggestedMinQuantity: { type: Type.NUMBER },
            locationSuggestion: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER, description: "Estimation du prix unitaire en euros" }
          },
          required: ["name", "category", "suggestedQuantity"],
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erreur Gemini:", error);
    throw error;
  }
};

export const getFabLabAdvice = async (query: string, inventory: InventoryItem[]): Promise<string> => {
    if (!API_KEY) return "Veuillez configurer votre clé API pour utiliser l'assistant.";

    try {
        // Prepare a simplified inventory string to save tokens
        const inventoryContext = inventory.map(i => 
            `- ${i.name} (${i.quantity} en stock, Loc: ${i.location})`
        ).join('\n');

        const prompt = `Tu es un assistant expert pour un gestionnaire de FabLab.
        Voici l'inventaire actuel du FabLab :
        ${inventoryContext}

        Réponds à la question suivante de manière utile, concise et professionnelle en français. Si la question concerne la faisabilité d'un projet, vérifie si nous avons les matériaux. Si elle concerne l'organisation, donne des conseils d'expert.
        
        Question utilisateur: "${query}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "Désolé, je n'ai pas pu générer de réponse.";
    } catch (error) {
        console.error("Erreur Gemini Chat:", error);
        return "Une erreur est survenue lors de la consultation de l'assistant.";
    }
}
