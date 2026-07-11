# App-Wide Semantic Theme Implementation Plan

This plan details how we will migrate the entire CollageShip application from hardcoded hex values (and default Tailwind grays) to a centralized, semantic color system using Tailwind CSS v4 `@theme` variables, without altering any layout or functionality.

## Goal
Implement a visual-only theme update across the app using semantic roles (e.g., `brand-navy`, `brand-coral`) mapped exactly to the user-provided palette, while ensuring destructive/error colors remain distinct.

## Proposed Changes

### 1. Centralize Theme Variables
**File:** `src/index.css`
I will add a `@theme` block at the root level to define the new CSS variables. Tailwind v4 will automatically generate the utility classes (`bg-brand-navy`, `text-text-primary`, etc.).

```css
@theme {
  --color-brand-navy: #0B3D62;
  --color-brand-navy-deep: #082C49;
  --color-brand-gold: #C98A3E;
  --color-brand-coral: #E2603A;
  --color-page-bg: #F7F3EC;
  --color-card-bg: #FFFFFF;
  --color-text-primary: #1B2733;
  --color-text-secondary: #5B6B7A;
  --color-border: #E4DFD3;
  --color-error: #D64545;
}
```

### 2. Map Existing Classes to Semantic Roles
I will write and execute a Node.js script (similar to the existing `changeThemeGoldBlue.cjs`) to intelligently replace Tailwind classes across all `.jsx` files based on the element's **role**:

- **Brand Navy (`brand-navy`, `brand-navy-deep`)**
  - Replace `[#002D62]` used in logos, active sidebar items, badges (e.g., "PUBLIC"), and section labels.
  - Replace darker shades (`[#002147]`, etc.) with `brand-navy-deep`.

- **Brand Gold (`brand-gold`)**
  - Replace `[#C5A059]` used in the tagline, "PRIVATE" badges, star ratings, and Admin Panel dropdown icon.

- **Primary Actions / Coral (`brand-coral`)**
  - **Crucial Step:** Currently, `[#002D62]` is used for BOTH primary buttons and brand elements. The script will specifically target `<button>` elements, "Apply", "Save", "Submit", and "Search" buttons, replacing their `bg-[#002D62]` with `bg-brand-coral`.
  - Replace the favorite heart icon colors with `brand-coral`.

- **Page Background (`page-bg`)**
  - Replace the pale lavender/blue-gray backgrounds (like `bg-[#f8faff]`, `bg-gray-50` used as page backgrounds) with `bg-page-bg`.

- **Text Colors (`text-primary`, `text-secondary`)**
  - Replace `text-gray-900` and `text-gray-800` (headings, titles, names) with `text-text-primary`.
  - Replace `text-gray-500` and `text-gray-400` (subtitles, nav links, meta text) with `text-text-secondary`.

- **Borders (`border`)**
  - Replace `border-gray-200`, `border-gray-100`, and `border-[#e1ecf7]` with `border-border`.

### 3. Maintain Semantic Separation
- **Error / Destructive Actions:** I will ensure that required-field red borders (`border-red-500` / `border-rose-500`), "REQUIRED" text, and "Logout" buttons remain distinct (mapping to `--color-error` or existing `red-600`) so they are not confused with the `brand-coral` buttons.

## Verification Plan
1. **Automated Script Execution:** Run the script to apply the changes.
2. **Manual Code Review:** Use `git diff` (via terminal) to verify that only color-related utility classes were touched.
3. **Build Check:** Run `npm run build` to ensure Tailwind compiles the new `@theme` variables correctly without errors.

> [!IMPORTANT]
> Because `[#002D62]` is currently used for *both* brand elements and primary buttons, the script will be carefully crafted to distinguish buttons from non-buttons so that only actionable buttons become Coral.

## User Review Required
Does this mapping strategy sound correct? If approved, I will immediately execute the script and finalize the theme update.
