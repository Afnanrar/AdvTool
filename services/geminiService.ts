import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Ensure you have your API key set in your environment variables
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.warn("API_KEY environment variable not set. Gemini API features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

/**
 * Generates a list of smart reply suggestions based on a given prompt.
 * @param prompt The prompt to send to the Gemini model.
 * @returns An array of suggested reply strings.
 */
export const generateSmartReplies = async (prompt: string): Promise<string[]> => {
    if (!apiKey) {
        return ["AI is disabled.", "Please configure your API key."];
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                // Use JSON mode for structured output
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        replies: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            }
                        }
                    }
                },
                // Disable thinking for low latency use-cases like smart reply
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
          throw new Error("No text returned from Gemini API.");
        }
        
        const parsed = JSON.parse(jsonText);
        
        if (parsed.replies && Array.isArray(parsed.replies)) {
            return parsed.replies;
        }

        throw new Error("Invalid JSON structure in Gemini API response.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate content from Gemini API.");
    }
};