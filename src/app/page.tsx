'use client';

import { useState } from 'react';
import { generateMealPlan } from './actions';
import { MealPlanResult } from '@/lib/types';

const SAMPLE_PROMPTS = [
  {
    day: "Busy workday, working from home, gym session at 6 PM, want quick meals.",
    diet: "High protein, low carb",
    budget: 600,
    servings: 2
  },
  {
    day: "Relaxed Sunday, hosting a friend for dinner, time to cook dinner.",
    diet: "Vegetarian",
    budget: 800,
    servings: 3
  },
  {
    day: "Full day of traveling, need highly packable breakfast and lunch.",
    diet: "Dairy-free",
    budget: 450,
    servings: 1
  }
];

export default function Home() {
  // State variables for gathering user input to feed into the Gemini API
  const [dayDescription, setDayDescription] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [budget, setBudget] = useState<number>(500);
  const [servings, setServings] = useState<number>(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Holds the structured JSON result returned by the Gemini model
  const [result, setResult] = useState<MealPlanResult | null>(null);

  // Client-side interactive checklists mapped directly from GenAI output lists
  const [purchasedItems, setPurchasedItems] = useState<Record<string, boolean>>({});
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});

  const applySample = (sample: typeof SAMPLE_PROMPTS[0]) => {
    setDayDescription(sample.day);
    setDietaryPreferences(sample.diet);
    setBudget(sample.budget);
    setServings(sample.servings);
  };

  /**
   * ==========================================
   * GEN AI CAPABILITY: Core Generation Action
   * ==========================================
   * Triggered when the user submits the form.
   * Calls the Server Action which handles communication, error handling, 
   * and retry logic with the Gemini API to get structured meal plan JSON.
   */
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayDescription.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setPurchasedItems({});
    setCompletedMeals({});

    try {
      const res = await generateMealPlan({
        dayDescription,
        dietaryPreferences,
        budget,
        servings
      });

      if (res.success && res.data) {
        // Successfully loaded the structured GenAI output
        setResult(res.data);
      } else {
        setError(res.error || 'Failed to generate your meal plan.');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const togglePurchased = (itemKey: string) => {
    setPurchasedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const toggleMealComplete = (mealKey: string) => {
    setCompletedMeals(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey]
    }));
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-xl font-bold text-black" role="img" aria-label="cooking pot">🍳</span>
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
                ChefGemini
              </span>
              <span className="text-[10px] block text-slate-500 -mt-1 font-medium tracking-widest uppercase">
                AI Meal Planner
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Powered by <span className="text-amber-400 font-semibold">Gemini 2.5 Flash</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 relative z-10">
        {!result && !loading && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            {/* Title / Hero */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Personalized Daily Meal Planner
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
                Enter details about your day, dietary preferences, and budget. Gemini will generate a custom breakfast, lunch, and dinner list with a consolidated grocery list.
              </p>
            </div>

            {/* Config Form */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
              <form onSubmit={handleGenerate} className="space-y-6">
                
                {/* Day description */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="dayDescription" className="text-sm font-medium text-slate-300">
                      How is your day looking?
                    </label>
                    <span className="text-xs text-slate-500">Required</span>
                  </div>
                  <textarea
                    id="dayDescription"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-100 placeholder-slate-500 outline-none transition duration-200 resize-none"
                    placeholder="e.g., Super busy workday with lots of meetings, hitting the gym in the evening, want quick/energizing food."
                    value={dayDescription}
                    onChange={(e) => setDayDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Dietary and budget grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Dietary restriction */}
                  <div className="space-y-2">
                    <label htmlFor="dietaryPreferences" className="text-sm font-medium text-slate-300">
                      Dietary Preferences
                    </label>
                    <input
                      id="dietaryPreferences"
                      type="text"
                      className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-100 placeholder-slate-500 outline-none transition"
                      placeholder="e.g., Vegan, Gluten-free, none"
                      value={dietaryPreferences}
                      onChange={(e) => setDietaryPreferences(e.target.value)}
                    />
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <label htmlFor="budget" className="text-sm font-medium text-slate-300 flex items-center justify-between">
                      <span>Daily Budget</span>
                      <span className="text-amber-500 text-xs font-semibold">₹ {budget}</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                      <input
                        id="budget"
                        type="number"
                        min="50"
                        max="10000"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-100 outline-none transition"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  {/* Servings */}
                  <div className="space-y-2">
                    <label htmlFor="servings" className="text-sm font-medium text-slate-300 flex items-center justify-between">
                      <span>Servings</span>
                      <span className="text-amber-500 text-xs font-semibold">{servings} {servings === 1 ? 'person' : 'people'}</span>
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setServings(s => Math.max(1, s - 1))}
                        aria-label="Decrease servings"
                        className="flex-1 py-1.5 rounded-lg text-slate-400 hover:bg-slate-900 active:scale-95 transition"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-semibold text-slate-200">{servings}</span>
                      <button
                        type="button"
                        onClick={() => setServings(s => Math.min(10, s + 1))}
                        aria-label="Increase servings"
                        className="flex-1 py-1.5 rounded-lg text-slate-400 hover:bg-slate-900 active:scale-95 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!dayDescription.trim()}
                  className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-lg shadow-amber-500/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
                >
                  Generate Chef Meal Plan & Checklist
                </button>
              </form>

              {/* Error boundary */}
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs">
                  <span className="font-semibold">Failed to build plan:</span> {error}
                </div>
              )}
            </div>

            {/* Quick samples section */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center">
                Or pick a quick scenario to test
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySample(sample)}
                    className="p-4 rounded-xl border border-slate-900 bg-slate-900/30 hover:border-slate-800 hover:bg-slate-900/50 text-left transition duration-200 group"
                  >
                    <p className="text-xs text-amber-500/80 font-bold mb-1 group-hover:text-amber-400">
                      Scenario {idx + 1}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {sample.day}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-500">
                      <span>₹{sample.budget} budget</span>
                      <span>•</span>
                      <span>{sample.diet || 'Regular'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading skeleton screen */}
        {loading && (
          <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
            <div className="space-y-2 text-center">
              <div className="h-8 bg-slate-900 rounded-lg w-2/3 mx-auto" />
              <div className="h-4 bg-slate-900 rounded-lg w-1/2 mx-auto" />
            </div>
            
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6">
              <div className="h-6 bg-slate-900 rounded-lg w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-32 bg-slate-900 rounded-xl" />
                ))}
              </div>
              <div className="h-40 bg-slate-900 rounded-xl" />
            </div>
          </div>
        )}

        {/* Output Screen */}
        {result && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Top Bar with Reset */}
            <div className="flex items-center justify-between bg-slate-900/40 border border-slate-900 px-5 py-4 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-200">
                  Your Custom Meal Plan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated for {servings} {servings === 1 ? 'serving' : 'servings'} • Budget goal: ₹{budget}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
              >
                ← Back to Planner
              </button>
            </div>

            {/* Main Plan Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 Columns: Meal Plan & Substitutes */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Meals Section */}
                <section className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span role="img" aria-label="plate with cutlery">🍽️</span> Breakfast, Lunch & Dinner Tasks
                  </h2>

                  <div className="grid grid-cols-1 gap-4">
                    {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
                      const meal = result.meals[mealType];
                      if (!meal) return null;
                      const isComplete = completedMeals[mealType];

                      return (
                        <div
                          key={mealType}
                          className={`relative border transition duration-300 rounded-2xl overflow-hidden ${
                            isComplete
                              ? 'border-emerald-900/40 bg-emerald-950/5'
                              : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-800 hover:bg-slate-900/40'
                          }`}
                        >
                          <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-start gap-4">
                            {/* Icon / Status indicator */}
                            <div className="flex items-center justify-between md:flex-col md:items-center gap-3">
                              <span className="text-3xl capitalize" role="img" aria-label={mealType}>
                                {mealType === 'breakfast' ? '🌅' : mealType === 'lunch' ? '☀️' : '🌙'}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleMealComplete(mealType)}
                                aria-label={`Mark ${mealType} as ${isComplete ? 'incomplete' : 'complete'}`}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                                  isComplete
                                    ? 'bg-emerald-500 border-emerald-400 text-black'
                                    : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                {isComplete ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <span className="text-xs" aria-hidden="true">Done</span>
                                )}
                              </button>
                            </div>

                            {/* Meal Info */}
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  {mealType}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-500 border border-slate-800">
                                  <span role="img" aria-label="prep time">⏱️</span> {meal.prepTime}
                                </span>
                              </div>

                              <h4 className={`text-base font-bold transition ${isComplete ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {meal.name}
                              </h4>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {meal.description}
                              </p>

                              {/* Ingredients checklist for the meal */}
                              <div className="pt-2 border-t border-slate-900 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                  Required Ingredients
                                </span>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                                  {meal.ingredients.map((ing, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                                      <span>{ing}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Substitutes Section */}
                {result.substitutes && result.substitutes.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span role="img" aria-label="substitutions">🔄</span> Smart Substitutions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.substitutes.map((sub, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-900 bg-slate-900/20 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="text-red-400 line-through">{sub.original}</span>
                            <span className="text-slate-500">→</span>
                            <span className="text-emerald-400">{sub.substitute}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            {sub.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Grocery Checklist & Budget Analysis */}
              <div className="space-y-8">
                
                {/* Budget Analysis Card */}
                {result.budgetAnalysis && (
                  <section className="space-y-3">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      <span role="img" aria-label="money bag">💰</span> Cost Breakdown
                    </h2>
                    <div className="p-5 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shadow-xl space-y-4">
                      
                      {/* Budget VS Cost Indicators */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-900">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                            Total Est. Cost
                          </span>
                          <span className="text-lg font-extrabold text-amber-500">
                            ₹{result.budgetAnalysis.totalEstimatedCost}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-900">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                            Target Budget
                          </span>
                          <span className="text-lg font-extrabold text-slate-300">
                            ₹{result.budgetAnalysis.budget}
                          </span>
                        </div>
                      </div>

                      {/* Within Budget Alert */}
                      <div className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-center text-xs font-semibold ${
                        result.budgetAnalysis.withinBudget
                          ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400'
                          : 'bg-orange-950/20 border-orange-900/60 text-orange-400'
                      }`}>
                        {result.budgetAnalysis.withinBudget ? (
                          <>
                            <span role="img" aria-label="check icon">✓</span> Under budget by ₹{result.budgetAnalysis.budget - result.budgetAnalysis.totalEstimatedCost}!
                          </>
                        ) : (
                          <>
                            <span role="img" aria-label="warning icon">⚠️</span> Exceeds target budget by ₹{result.budgetAnalysis.totalEstimatedCost - result.budgetAnalysis.budget}.
                          </>
                        )}
                      </div>

                      {/* Savings Tips */}
                      {result.budgetAnalysis.savingsTips && result.budgetAnalysis.savingsTips.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Budget Tips & Tricks
                          </span>
                          <ul className="space-y-1.5">
                            {result.budgetAnalysis.savingsTips.map((tip, idx) => (
                              <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                                <span className="text-amber-500 mt-0.5" aria-hidden="true">•</span>
                                <span className="leading-relaxed">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Consolidated Grocery Checklist */}
                {result.groceryList && result.groceryList.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        <span role="img" aria-label="shopping cart">🛒</span> Grocery Checklist
                      </h2>
                      <span className="text-xs text-slate-500">
                        {Object.values(purchasedItems).filter(Boolean).length} / {result.groceryList.length} checked
                      </span>
                    </div>

                    <div className="rounded-2xl border border-slate-900 bg-slate-950 overflow-hidden">
                      <div className="divide-y divide-slate-900">
                        {result.groceryList.map((item, idx) => {
                          const itemKey = `${item.item}-${idx}`;
                          const isChecked = purchasedItems[itemKey];

                          return (
                            <div
                              key={itemKey}
                              role="checkbox"
                              aria-checked={isChecked}
                              tabIndex={0}
                              onClick={() => togglePurchased(itemKey)}
                              onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                  e.preventDefault();
                                  togglePurchased(itemKey);
                                }
                              }}
                              className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none transition focus:outline-none focus:bg-slate-900/40 rounded-xl ${
                                isChecked
                                  ? 'bg-slate-900/20 hover:bg-slate-900/30 opacity-60'
                                  : 'hover:bg-slate-900/30'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                  isChecked
                                    ? 'bg-amber-500 border-amber-400 text-black'
                                    : 'border-slate-800'
                                }`} aria-hidden="true">
                                  {isChecked && (
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>

                                <div className="space-y-0.5">
                                  <span className={`text-xs font-semibold ${isChecked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {item.item}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                      {item.quantity}
                                    </span>
                                    <span>•</span>
                                    <span>{item.category}</span>
                                  </div>
                                </div>
                              </div>

                              <span className={`text-xs font-bold ${isChecked ? 'text-slate-600' : 'text-slate-400'}`}>
                                ₹{item.estimatedCost}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                )}

              </div>

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900/80 text-center text-[11px] text-slate-600 z-10">
        <p>&copy; {new Date().getFullYear()} ChefGemini Daily Planner. Keep it healthy, keep it budget-friendly.</p>
      </footer>
    </div>
  );
}
