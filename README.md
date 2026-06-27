# 🍳 ChefGemini — AI-Powered Daily Meal Planner

**ChefGemini** is a premium, responsive, and budget-conscious daily meal planner and grocery checklist web application. Built with Next.js 16 (App Router), Tailwind CSS v4, and the official Google GenAI SDK, ChefGemini generates fully tailored daily menus (Breakfast, Lunch, Dinner) along with a consolidated grocery checklist, cost estimation, and intelligent ingredient substitutions.

---

## ✨ Key Features

- **Context-Aware Prompting:** Tailors breakfast, lunch, and dinner suggestions directly to your day (e.g., quick-prep meals for busy workdays, packable options for travel, or elaborate dishes for relaxed weekends).
- **Dietary & Serving Constraints:** Adapts generated recipes and ingredient lists to dietary preferences (e.g., Vegan, Gluten-Free, High-Protein) and dynamic serving sizes.
- **Budget Tracking in Indian Rupees (₹):** Performs automated pricing estimations and outputs a detailed comparison showing if your menu is within budget, complete with AI-powered savings tips.
- **Interactive Checklist System:** Tracks grocery shopping progress and meal prep stages on the client-side with interactive check-off lists.
- **Smart Ingredient Substitution:** Automatically suggests alternative ingredients if standard options are allergen-prone, costly, or difficult to find.
- **Robust API Resilience:** Implements server-side retries with exponential backoff to handle network inconsistencies or temporary API rate limits smoothly.
- **Premium User Experience:** Designed with a sleek, responsive dark-mode palette, glassmorphism containers, smooth interactive transitions, and glowing amber/orange accents.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Programming Language:** [TypeScript](https://www.typescriptlang.org/)
- **GenAI SDK:** [`@google/genai` (Official Google GenAI SDK)](https://github.com/google/generative-ai-js)
- **AI Model:** `gemini-2.5-flash`

---

## 📂 Project Architecture

```
warmup-challenge-promptwars/
├── public/                  # Static assets and favicons
├── src/
│   ├── app/
│   │   ├── actions.ts       # Server action handling Gemini prompt, schema, and API requests
│   │   ├── globals.css      # Core tailwind setup and custom animations
│   │   ├── layout.tsx       # App-wide root layout
│   │   └── page.tsx         # Responsive UI layout, state tracking, and interactive checklists
│   └── lib/
│       ├── gemini.ts        # GoogleGenAI client instantiation
│       └── types.ts         # TypeScript interfaces for input validation and output schema
├── .env.local               # Environment variable configuration (contains GEMINI_API_KEY)
├── package.json             # Core dependency settings & scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

---

## 🤖 Generative AI Integration

### 1. Unified Persona & Structured Output
ChefGemini leverages Gemini's system instructions to enforce a strictly typed JSON response format that matches our application interfaces. The model is instructed to act as a culinary expert and budget-conscious meal planner.

### 2. Strict JSON Schema Validation
By configuring `responseMimeType: 'application/json'` in the model call config, we guarantee that the output from the API is valid JSON conformant to the following structure:
```json
{
  "meals": {
    "breakfast": { "name": "string", "description": "string", "prepTime": "string", "ingredients": ["string"] },
    "lunch": { "name": "string", "description": "string", "prepTime": "string", "ingredients": ["string"] },
    "dinner": { "name": "string", "description": "string", "prepTime": "string", "ingredients": ["string"] }
  },
  "groceryList": [
    { "item": "string", "quantity": "string", "estimatedCost": 0, "category": "string" }
  ],
  "substitutes": [
    { "original": "string", "substitute": "string", "reason": "string" }
  ],
  "budgetAnalysis": {
    "totalEstimatedCost": 0,
    "budget": 0,
    "withinBudget": true,
    "savingsTips": ["string"]
  }
}
```

### 3. API Resilience & Retries
The server actions block includes a **3-attempt exponential backoff retry loop** targeting `ai.models.generateContent` to ensure high availability and gracefully mitigate rate limits or connection hiccups:
```typescript
for (let i = 0; i < attempts; i++) {
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });
    break; // Exit loop on success
  } catch (err) {
    if (i === attempts - 1) throw err;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs *= 2;
  }
}
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js (v18.x or later)](https://nodejs.org/) installed.

### 1. Clone the repository
```bash
git clone https://github.com/mr-talukdar/warmup-challenges.git
cd warmup-challenge-promptwars
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a file named `.env.local` in the root of the project and add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note:** You can obtain a free or pay-as-you-go Gemini API Key via [Google AI Studio](https://aistudio.google.com/).

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

---

## 📦 Build for Production

To create an optimized production build of the project:
```bash
npm run build
npm run start
```
