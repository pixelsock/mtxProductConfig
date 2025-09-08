# Branding & Style Guide

## Established Visual Design System

The MTX Product Configurator follows a **professional, technical aesthetic** that emphasizes clarity, precision, and trust. This section documents the established visual language to ensure brand consistency in future development.

### Brand Identity & Visual Philosophy

The established design reflects the MTX brand values:

1. **Technical Precision**: Clean, measured layouts that reflect manufacturing quality
2. **Professional Trust**: Conservative color palette with reliable interaction patterns  
3. **Product Focus**: Visual hierarchy that prioritizes product visualization
4. **Accessibility First**: High contrast ratios and clear visual relationships

### Color System (Established)

The configurator uses a carefully selected color palette optimized for product configuration:

#### Primary Colors
```css
/* Amber - Primary brand accent */
--amber-50: #fffbeb;    /* Selection highlights, active backgrounds */
--amber-100: #fef3c7;   /* Subtle hover states */
--amber-500: #f59e0b;   /* Primary CTA buttons, active selections */
--amber-600: #d97706;   /* Button hover states, focused interactions */

/* Professional Grays - Primary interface colors */
--gray-50: #f9fafb;     /* Light backgrounds, disabled states */
--gray-100: #f3f4f6;    /* Card backgrounds, subtle dividers */
--gray-200: #e5e7eb;    /* Borders, inactive elements */
--gray-300: #d1d5db;    /* Hover borders, subtle separators */
--gray-600: #4b5563;    /* Secondary text, descriptions */  
--gray-700: #374151;    /* Labels, form text */
--gray-900: #111827;    /* Primary text, headings */
```

#### Semantic Colors  
```css
/* Success/Error States */
--green-50: #f0fdf4;    /* Success backgrounds */
--green-500: #22c55e;   /* Success indicators */
--red-50: #fef2f2;      /* Error backgrounds */
--red-500: #ef4444;     /* Error states, destructive actions */

/* Muted States */
--muted: #f1f5f9;       /* Subtle backgrounds */
--muted-foreground: #64748b;  /* Secondary text on muted */
```

### Typography System (Established)

The configurator uses a **system font stack** optimized for readability and performance:

#### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

#### Typography Scale
```css
/* Headings - Consistent hierarchy */
.text-xl {     /* 20px - Section headings */
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 600;
}

.text-lg {     /* 18px - Card titles */
  font-size: 1.125rem; 
  line-height: 1.75rem;
  font-weight: 600;
}

.text-base {   /* 16px - Standard body text */
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 400;
}

.text-sm {     /* 14px - Supporting text, descriptions */
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
}

.text-xs {     /* 12px - Labels, badges, metadata */
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* Special Typography */
.font-mono {   /* SKU codes, technical data */
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}
```

### Spacing System (Established)

Consistent spacing creates visual rhythm and hierarchy:

```css
/* Spacing Scale - Powers of 0.25rem (4px) */
--spacing-1: 0.25rem;   /* 4px - Tight spacing */
--spacing-2: 0.5rem;    /* 8px - Element padding */
--spacing-3: 0.75rem;   /* 12px - Component spacing */
--spacing-4: 1rem;      /* 16px - Standard padding */  
--spacing-6: 1.5rem;    /* 24px - Section spacing */
--spacing-8: 2rem;      /* 32px - Large gaps */
--spacing-10: 2.5rem;   /* 40px - Major sections */
```

### Border & Radius System (Established)

Consistent border treatments create cohesive visual language:

```css
/* Border Weights */
border: 1px solid;      /* Standard borders */
border-2: 2px solid;    /* Selection states, focus rings */

/* Border Radius */
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.375rem;  /* 6px - Default buttons, inputs */
--radius-lg: 0.5rem;    /* 8px - Cards, containers */
--radius-xl: 0.75rem;   /* 12px - Large cards */
```

### Shadows & Elevation (Established)

Subtle shadows create depth without distraction:

```css
/* Shadow System */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);     /* Subtle cards */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);    /* Raised elements */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);  /* Modals, overlays */
```

### Icon System (Established)

The configurator uses **Lucide React** icons for consistent visual language:

```typescript
// Standard icon usage patterns
import { Plus, Minus, Search, Copy, X } from 'lucide-react';

// Icon sizing conventions
className="w-4 h-4"     // 16px - Standard buttons, inline icons  
className="w-5 h-5"     // 20px - Larger buttons, prominence
className="w-6 h-6"     // 24px - Feature icons, emphasis
```

### Button Styling System (Established)

The button system provides clear hierarchy and interaction feedback:

```css
/* Primary Button - Amber brand color */
.btn-primary {
  background-color: #f59e0b;  /* amber-500 */
  color: white;
  border-radius: 0.375rem;    /* 6px */
  padding: 0.5rem 1rem;       /* 8px 16px */
  font-weight: 500;
  transition: all 150ms;
}

.btn-primary:hover {
  background-color: #d97706;  /* amber-600 */
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Secondary Button - Neutral outline */
.btn-secondary {
  background-color: transparent;
  color: #374151;             /* gray-700 */
  border: 1px solid #d1d5db;  /* gray-300 */
  border-radius: 0.375rem;
}

.btn-secondary:hover {
  background-color: #f9fafb;  /* gray-50 */
  border-color: #9ca3af;      /* gray-400 */
}
```

### Form & Input Styling (Established)

Consistent form styling ensures usability and accessibility:

```css
/* Input Field Standards */
.form-input {
  background-color: #f9fafb;  /* gray-50 */
  border: 1px solid #d1d5db;  /* gray-300 */
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;      /* 12px 16px */
  font-size: 0.875rem;        /* 14px */
}

.form-input:focus {
  outline: none;
  border-color: #f59e0b;      /* amber-500 */
  box-shadow: 0 0 0 3px rgb(245 158 11 / 0.1);
}

/* Label Standards */
.form-label {
  font-size: 0.75rem;         /* 12px */
  font-weight: 500;
  color: #374151;             /* gray-700 */
  text-transform: uppercase;
  letter-spacing: 0.025em;
}
```

### Brand Guidelines for Extension

When adding new UI elements or extending the design system:

1. **Color Usage**:
   - Use amber sparingly for primary actions and selections only
   - Maintain gray scale hierarchy for content organization  
   - Reserve semantic colors (red, green) for status communication

2. **Typography**:
   - Limit to established font sizes and weights
   - Use monospace only for technical data (SKUs, codes)
   - Maintain consistent line heights and letter spacing

3. **Spacing**:
   - Use 4px increment spacing system consistently
   - Maintain established padding patterns within components
   - Preserve visual rhythm through consistent spacing

4. **Interactive States**:
   - Follow established hover, focus, and selection patterns
   - Maintain consistent transition timing (150ms)
   - Use established shadow patterns for elevation

5. **Brand Voice**:
   - Keep interface copy concise and technical
   - Use sentence case for interface elements
   - Maintain professional, helpful tone in messaging

**Design System Reference**: All visual standards implemented through TailwindCSS configuration and custom CSS properties. Component-specific styles documented in respective component files.
