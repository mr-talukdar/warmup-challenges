# Accessibility & Testing Improvement Guide

This document outlines the standard techniques and steps to achieve high scores in **Testing** and **Accessibility** for Next.js challenges. Use this guide as a blueprint at the start of any new challenge to ensure these criteria are met out-of-the-box.

---

## 🛠️ Testing Setup & Implementation Blueprint

To avoid a `0/100` score on testing, you must configure a local runner and provide unit/integration coverage for all major client interactions and Server Actions.

### 1. Installation Checklist
Always install the following devDependencies:
```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

### 2. Configuration Files

#### `vitest.config.ts`
Place this in your project root to handle JSX compilation, aliases, and the browser environment (jsdom):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### `vitest.setup.ts`
Import matchers like `.toBeInTheDocument()` and `.toHaveAttribute()`:
```typescript
import '@testing-library/jest-dom';
```

#### `package.json`
Add the run script under the `"scripts"` field:
```json
"test": "vitest run"
```

### 3. Writing Server Action Tests
When testing Server Actions (e.g. Gemini API wrapper functions), mock external SDK modules (such as `@google/genai`) to test resilience (such as retry loops), environment checks, and proper parsing:
- **Mock standard exports:** `vi.mock('@/lib/gemini', ...)`
- **Reset environments:** Reset `process.env` before and after test groups.
- **Assertion focus:** Assert correct retries on failures, parameter mapping, and correct return models.

### 4. Writing UI Component/Integration Tests
Use `@testing-library/react` to test client pages.
- **Mock Server Actions:** Standard server actions should be mocked using `vi.mock('./actions', ...)` to return stubbed success/failure data.
- **Use Regex Queries:** When querying elements containing dynamic text, query with substring/regex (e.g., `screen.getByLabelText(/Daily Budget/i)`) rather than hardcoded strings, to prevent test failures when state changes.
- **Assert Keypress Interactions:** Test both mouse `click` and keyboard `Space` / `Enter` presses for custom controls.

---

## ♿ Accessibility (a11y) Remediation Blueprint

Standard components often contain hidden accessibility violations. Check off the following fixes to achieve `95+` on accessibility evaluations.

### 1. Emoji & Icon Attributes
Never write raw emojis inside text without labeling or hiding them:
* **Informational Emojis:** Wrap in a `span` with `role="img"` and `aria-label`:
  ```tsx
  <span role="img" aria-label="cooking pot">🍳</span>
  ```
* **Decorative/Structural Elements:** If an icon/emoji is purely decorative and adjacent to clear label text, hide it from screen readers:
  ```tsx
  <svg aria-hidden="true" ... />
  ```

### 2. Form Steppers & Buttons
Buttons containing only a symbol (like `+`, `-`, or an icon) must have a text description:
```tsx
<button type="button" aria-label="Increase servings">+</button>
```

### 3. Accessible Custom Checkboxes
If you implement a custom list element with checking states (like a checklist wrapper `div` with `onClick`):
1. **Add Accessibility Roles:** Use `role="checkbox"` and `aria-checked={isChecked}`.
2. **Enable Keyboard Focus:** Add `tabIndex={0}` to allow keyboard users to tab into the checkbox.
3. **Add Keydown Support:** Implement an `onKeyDown` handler listening for `Space` (`' '`) or `Enter` keys to trigger toggle:
   ```tsx
   onKeyDown={(e) => {
     if (e.key === ' ' || e.key === 'Enter') {
       e.preventDefault();
       togglePurchased(itemKey);
     }
   }}
   ```
4. **Style Focus States:** Ensure visual focus indicators are styled for keyboard navigation (e.g. `focus:outline-none focus:ring-2`).

### 5. Correct Heading Hierarchy
Ensure your headings flow sequentially without skipped levels:
- `<h1>` (Only one per page, used for page titles).
- `<h2>` (Section headings).
- `<h3>` (Sub-sections under h2).
Ensure that there is no `<h3>` directly placed under an `<h1>` without an intermediate `<h2>`.
