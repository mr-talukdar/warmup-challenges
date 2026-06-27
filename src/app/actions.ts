'use server';

import { ai } from '@/lib/gemini';
import { MealPlanInput, MealPlanResult } from '@/lib/types';

/**
 * Server Action to generate a structured meal plan using Gemini.
 * Clean, robust, and commented to highlight Gen AI capabilities.
 */
export async function generateMealPlan(input: MealPlanInput) {
  try {
    // Robust environment validation before attempting API calls
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: 'GEMINI_API_KEY is not configured in .env.local. Please add it to start using Gemini.',
      };
    }

    const { dayDescription, dietaryPreferences, budget, servings } = input;

    /**
     * ==========================================
     * GEN AI CAPABILITY: Persona & Schema definition (System Instructions)
     * ==========================================
     * System instructions set the model's persona (culinary expert & budget-conscious planner)
     * and define the strict JSON schema required for structural integration with the frontend application.
     */
    const systemInstruction = `You are a culinary expert and budget-conscious meal planner. 
Generate a structured, customized meal plan for a single day based on the user's schedule/day, dietary preferences, budget, and servings.
You must return a valid JSON object matching this schema:
{
  "meals": {
    "breakfast": {
      "name": "string (name of meal)",
      "description": "string (brief summary)",
      "prepTime": "string (e.g. '15 mins')",
      "ingredients": ["string (ingredient name and amount)"]
    },
    "lunch": {
      "name": "string",
      "description": "string",
      "prepTime": "string",
      "ingredients": ["string"]
    },
    "dinner": {
      "name": "string",
      "description": "string",
      "prepTime": "string",
      "ingredients": ["string"]
    }
  },
  "groceryList": [
    {
      "item": "string (name of grocery item)",
      "quantity": "string (quantity needed)",
      "estimatedCost": number (cost in ₹ / Rupees),
      "category": "string (Produce, Pantry, Dairy, Meat, etc.)"
    }
  ],
  "substitutes": [
    {
      "original": "string (original ingredient)",
      "substitute": "string (suggested substitute)",
      "reason": "string (e.g. dairy-free alternative, cheaper alternative)"
    }
  ],
  "budgetAnalysis": {
    "totalEstimatedCost": number (sum of estimatedCost of all grocery items),
    "budget": number (the user's budget),
    "withinBudget": boolean (true if totalEstimatedCost <= budget),
    "savingsTips": ["string (tip on how to stay under budget or save money on this meal plan)"]
  }
}`;

    /**
     * ==========================================
     * GEN AI CAPABILITY: Context-Aware Dynamic Prompting
     * ==========================================
     * The prompt dynamically feeds user inputs to the model.
     * It requests situational meal mapping, ingredient constraint checking,
     * currency conversion (Rupees), and substitution generation.
     */
    const prompt = `Create a daily meal plan for ${servings} servings.
User's Day Description: "${dayDescription}"
Dietary Preferences/Restrictions: "${dietaryPreferences || 'None'}"
Total Budget for the day: ₹${budget}

Please ensure that:
1. The meals are tailored to the user's day description (e.g., quick/easy meals for busy days, or comforting meals for relaxed days).
2. The ingredients align with their dietary preferences.
3. The groceryList and budgetAnalysis calculate total estimated costs in Indian Rupees (₹) and check if it's within the ₹${budget} budget.
4. Provide appropriate substitutes if any ingredient is expensive, hard to find, or conflicts with potential common dietary concerns.`;

    let response;
    const attempts = 3;
    let delayMs = 1000;

    /**
     * ==========================================
     * GEN AI CAPABILITY: API Request & Robust Error-Handling with Retries
     * ==========================================
     * We call `ai.models.generateContent` with:
     *   - Model: 'gemini-2.5-flash' (high speed, cost-effective, ideal for structured output JSON tasks)
     *   - Config: Enforces `responseMimeType: 'application/json'` to guarantee client-side parseable output.
     * Includes a 3-attempt exponential backoff retry loop to handle potential rate limits or API hiccups.
     */
    for (let i = 0; i < attempts; i++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });
        break; // Success!
      } catch (err) {
        if (i === attempts - 1) throw err;
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(`Gemini API call failed (attempt ${i + 1}/${attempts}), retrying in ${delayMs}ms...`, errorMessage);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
      }
    }

    if (!response) {
      throw new Error('Failed to retrieve response from Gemini API.');
    }

    const text = response.text || '';
    
    // Validate and parse the generated JSON output
    const parsedData: MealPlanResult = JSON.parse(text);

    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    console.error('Error generating meal plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while connecting to the Gemini API.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

