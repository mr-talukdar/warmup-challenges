import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateMealPlan } from './actions';
import { ai } from '@/lib/gemini';

// Mock the AI client
vi.mock('@/lib/gemini', () => {
  return {
    ai: {
      models: {
        generateContent: vi.fn(),
      },
    },
  };
});

describe('generateMealPlan server action', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.GEMINI_API_KEY = 'mock-api-key';
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should return error if GEMINI_API_KEY is not defined', async () => {
    delete process.env.GEMINI_API_KEY;
    const result = await generateMealPlan({
      dayDescription: 'Busy workday',
      dietaryPreferences: 'Vegan',
      budget: 500,
      servings: 2,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('GEMINI_API_KEY is not configured');
  });

  it('should successfully return parsed meal plan from Gemini API', async () => {
    const mockPlan = {
      meals: {
        breakfast: {
          name: 'Poha',
          description: 'Spiced flattened rice',
          prepTime: '10 mins',
          ingredients: ['flattened rice', 'onions', 'peanuts'],
        },
        lunch: {
          name: 'Dal Rice',
          description: 'Lentil soup with rice',
          prepTime: '20 mins',
          ingredients: ['lentils', 'rice', 'spices'],
        },
        dinner: {
          name: 'Roti and Paneer',
          description: 'Flatbread with cottage cheese curry',
          prepTime: '30 mins',
          ingredients: ['wheat flour', 'paneer', 'tomatoes'],
        },
      },
      groceryList: [
        { item: 'paneer', quantity: '200g', estimatedCost: 100, category: 'Dairy' },
      ],
      substitutes: [],
      budgetAnalysis: {
        totalEstimatedCost: 100,
        budget: 500,
        withinBudget: true,
        savingsTips: [],
      },
    };

    vi.mocked(ai.models.generateContent).mockResolvedValue({
      text: JSON.stringify(mockPlan),
    } as any);

    const result = await generateMealPlan({
      dayDescription: 'Busy workday',
      dietaryPreferences: 'Vegetarian',
      budget: 500,
      servings: 2,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockPlan);
    expect(ai.models.generateContent).toHaveBeenCalledTimes(1);
  });

  it('should retry on API failure and eventually succeed', async () => {
    const mockPlan = {
      meals: {
        breakfast: { name: 'Oats', description: 'Simple oatmeal', prepTime: '5 mins', ingredients: ['oats', 'water'] },
        lunch: { name: 'Salad', description: 'Fresh vegetables', prepTime: '10 mins', ingredients: ['lettuce', 'cucumber'] },
        dinner: { name: 'Soup', description: 'Warm vegetable soup', prepTime: '15 mins', ingredients: ['carrots', 'peas'] },
      },
      groceryList: [],
      substitutes: [],
      budgetAnalysis: { totalEstimatedCost: 0, budget: 300, withinBudget: true, savingsTips: [] },
    };

    // First and second call throws error, third call succeeds
    vi.mocked(ai.models.generateContent)
      .mockRejectedValueOnce(new Error('Rate limit exceeded'))
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce({
        text: JSON.stringify(mockPlan),
      } as any);

    const result = await generateMealPlan({
      dayDescription: 'Busy day',
      dietaryPreferences: 'None',
      budget: 300,
      servings: 1,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockPlan);
    expect(ai.models.generateContent).toHaveBeenCalledTimes(3);
  });

  it('should return error if Gemini API calls fail after maximum retries', async () => {
    vi.mocked(ai.models.generateContent).mockRejectedValue(new Error('API Down'));

    const result = await generateMealPlan({
      dayDescription: 'Busy day',
      dietaryPreferences: 'None',
      budget: 300,
      servings: 1,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('API Down');
    expect(ai.models.generateContent).toHaveBeenCalledTimes(3);
  });
});
