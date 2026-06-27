export interface MealPlanInput {
  dayDescription: string;
  dietaryPreferences: string;
  budget: number;
  servings: number;
}

export interface Meal {
  name: string;
  description: string;
  prepTime: string;
  ingredients: string[];
}

export interface GroceryItem {
  item: string;
  quantity: string;
  estimatedCost: number;
  category: string;
}

export interface Substitute {
  original: string;
  substitute: string;
  reason: string;
}

export interface BudgetAnalysis {
  totalEstimatedCost: number;
  budget: number;
  withinBudget: boolean;
  savingsTips: string[];
}

export interface MealPlanResult {
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
  };
  groceryList: GroceryItem[];
  substitutes: Substitute[];
  budgetAnalysis: BudgetAnalysis;
}
