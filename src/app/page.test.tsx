import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './page';
import { generateMealPlan } from './actions';

// Mock the actions file
vi.mock('./actions', () => {
  return {
    generateMealPlan: vi.fn(),
  };
});

describe('Home Page Meal Planner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the planner form initially with correct headings', () => {
    render(<Home />);
    
    // Check main heading
    expect(screen.getByText('Personalized Daily Meal Planner')).toBeInTheDocument();
    
    // Check textarea labels
    expect(screen.getByLabelText('How is your day looking?')).toBeInTheDocument();
    expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
    
    // Check servings controls
    expect(screen.getByLabelText('Decrease servings')).toBeInTheDocument();
    expect(screen.getByLabelText('Increase servings')).toBeInTheDocument();
  });

  it('updates input fields correctly', () => {
    render(<Home />);
    
    const dayInput = screen.getByLabelText('How is your day looking?') as HTMLTextAreaElement;
    const dietInput = screen.getByLabelText('Dietary Preferences') as HTMLInputElement;
    const budgetInput = screen.getByLabelText(/Daily Budget/i) as HTMLInputElement;

    fireEvent.change(dayInput, { target: { value: 'Working hard' } });
    fireEvent.change(dietInput, { target: { value: 'Keto' } });
    fireEvent.change(budgetInput, { target: { value: '600' } });

    expect(dayInput.value).toBe('Working hard');
    expect(dietInput.value).toBe('Keto');
    expect(budgetInput.value).toBe('600');
  });

  it('submits form and displays the meal plan output screen', async () => {
    const mockMealPlan = {
      meals: {
        breakfast: {
          name: 'Healthy Oats',
          description: 'Oats with berries',
          prepTime: '5 mins',
          ingredients: ['Oats', 'Blueberries', 'Almond Milk'],
        },
        lunch: {
          name: 'Quinoa Bowl',
          description: 'Quinoa with roasted vegetables',
          prepTime: '15 mins',
          ingredients: ['Quinoa', 'Bell Pepper', 'Olive Oil'],
        },
        dinner: {
          name: 'Baked Tofu',
          description: 'Tofu with broccoli',
          prepTime: '20 mins',
          ingredients: ['Tofu', 'Broccoli', 'Soy Sauce'],
        },
      },
      groceryList: [
        { item: 'Oats', quantity: '100g', estimatedCost: 50, category: 'Pantry' },
        { item: 'Tofu', quantity: '200g', estimatedCost: 80, category: 'Protein' },
      ],
      substitutes: [
        { original: 'Almond Milk', substitute: 'Water', reason: 'Cheaper alternative' },
      ],
      budgetAnalysis: {
        totalEstimatedCost: 130,
        budget: 500,
        withinBudget: true,
        savingsTips: ['Buy bulk oats'],
      },
    };

    vi.mocked(generateMealPlan).mockResolvedValue({
      success: true,
      data: mockMealPlan,
    });

    render(<Home />);

    const dayInput = screen.getByLabelText('How is your day looking?');
    fireEvent.change(dayInput, { target: { value: 'Busy day ahead' } });

    const submitBtn = screen.getByRole('button', { name: /Generate Chef Meal Plan/i });
    fireEvent.click(submitBtn);

    // Should show loading status or content soon
    await waitFor(() => {
      expect(screen.getByText('Your Custom Meal Plan')).toBeInTheDocument();
    });

    // Check rendered meals
    expect(screen.getByText('Healthy Oats')).toBeInTheDocument();
    expect(screen.getByText('Quinoa Bowl')).toBeInTheDocument();
    expect(screen.getByText('Baked Tofu')).toBeInTheDocument();

    // Check grocery list items and cost breakdown
    expect(screen.getByText('Total Est. Cost')).toBeInTheDocument();
    expect(screen.getByText('₹130')).toBeInTheDocument();
    expect(screen.getByText('Under budget by ₹370!')).toBeInTheDocument();

    // Verify custom checklist items are in document and queryable as checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    // We have 2 grocery items (each has key itemKey)
    expect(checkboxes.length).toBe(2);

    // Click on the first checkbox (Oats)
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true');
    
    // Press space key on second checkbox (Tofu)
    fireEvent.keyDown(checkboxes[1], { key: ' ', code: 'Space' });
    expect(checkboxes[1]).toHaveAttribute('aria-checked', 'true');

    // Clicking "Back to Planner" returns to original screen
    const backBtn = screen.getByRole('button', { name: /Back to Planner/i });
    fireEvent.click(backBtn);

    expect(screen.getByText('Personalized Daily Meal Planner')).toBeInTheDocument();
  });
});
