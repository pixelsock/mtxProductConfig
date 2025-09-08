# Component Library

## Established Component Architecture (shadcn/ui + Custom)

The MTX Product Configurator leverages a robust component library built on **shadcn/ui** with custom extensions. This section documents the established component system to ensure consistency when extending functionality.

### Core UI Component Library (30+ Components)

The project includes a comprehensive shadcn/ui implementation with the following established components:

#### Form & Input Components
- **Button** (`button.tsx`): CVA-based variants (default, destructive, outline, secondary, ghost, link) with size options
- **Input** (`input.tsx`): Base input component with consistent styling
- **Label** (`label.tsx`): Form labels with accessibility support  
- **Switch** (`switch.tsx`): Toggle switches used for custom size mode
- **Select** (`select.tsx`): Dropdown selections with proper focus management
- **Checkbox** (`checkbox.tsx`): Checkbox inputs with validation states
- **Radio Group** (`radio-group.tsx`): Radio button groups for exclusive selections
- **Textarea** (`textarea.tsx`): Multi-line text input component

#### Layout & Container Components
- **Card** (`card.tsx`): Flexible card container with header, content, footer, and action areas
- **Separator** (`separator.tsx`): Visual content dividers
- **Sheet** (`sheet.tsx`): Slide-out panels for mobile interactions
- **Dialog** (`dialog.tsx`): Modal dialogs with backdrop and focus management
- **Tabs** (`tabs.tsx`): Tab navigation for grouped content
- **Collapsible** (`collapsible.tsx`): Expandable/collapsible sections
- **Accordion** (`accordion.tsx`): Stacked collapsible sections

#### Feedback & Display Components
- **Badge** (`badge.tsx`): Status indicators and labels with monospace support for SKUs
- **Alert** (`alert.tsx`): User notifications and status messages
- **Toast/Sonner** (`sonner.tsx`): Real-time notifications for actions
- **Tooltip** (`tooltip.tsx`): Contextual help and information
- **Progress** (`progress.tsx`): Loading and completion indicators
- **Skeleton** (`skeleton.tsx`): Loading placeholders

#### Navigation Components
- **Breadcrumb** (`breadcrumb.tsx`): Hierarchical navigation
- **Navigation Menu** (`navigation-menu.tsx`): Main navigation structures
- **Dropdown Menu** (`dropdown-menu.tsx`): Contextual action menus
- **Command** (`command.tsx`): Command palette for quick actions

### Custom Application Components

Built on top of the shadcn/ui foundation, these custom components implement specific configurator functionality:

#### Core Configuration Components
```typescript
// Current Configuration Display
CurrentConfiguration - displays selected options with grid layout
- Uses: Card, Badge, Button, Input components
- Patterns: Two-column responsive grid, consistent badge styling
- Location: src/components/ui/current-configuration.tsx:1-384

// Dynamic Options Rendering  
DynamicOptions - renders option selection interfaces
- Supports: color-swatch, size-grid, grid-2, multi UI types
- Uses: Button, Input, Label, Switch, Badge components
- Location: src/components/ui/dynamic-options.tsx:1-210

DynamicOptionsContainer - manages option loading and state
- Handles: API integration, caching, error states
- Location: src/components/ui/dynamic-options-container.tsx:1-112
```

#### Product Display Components
```typescript
// Product Line Selection
ProductLineSelector - dropdown for switching product lines
- Location: src/components/ui/product-line-selector.tsx

// SKU Management
SkuDisplay - shows current SKU with copy functionality
- Uses: Badge, Button components with monospace styling
- Location: src/components/ui/sku-display.tsx

SkuSearch - search interface for finding existing configurations  
- Uses: Input, Button components with autocomplete
- Location: src/components/ui/sku-search.tsx

SkuSearchHeader - combined search and navigation header
- Location: src/components/ui/sku-search-header.tsx
```

#### Utility Components
```typescript
// Environment Awareness
EnvironmentIndicator - shows development/staging environment
- Location: src/components/ui/environment-indicator.tsx
```

### Component Usage Patterns

#### 1. Card Component Pattern (Established)
```typescript
// Standard configuration card structure
<Card className="w-full">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content with consistent spacing */}
  </CardContent>
  <CardFooter className="flex items-center justify-between pt-6 border-t">
    {/* Actions and controls */}
  </CardFooter>
</Card>
```

#### 2. Option Selection Pattern (Established)
```typescript
// Consistent selection interface
<button 
  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
    selected 
      ? 'border-amber-500 bg-amber-50' 
      : disabled 
        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  }`}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      {/* Icon/color indicator if applicable */}
      <div>
        <div className="font-medium text-gray-900">{option.name}</div>
        {/* Optional description */}
      </div>
    </div>
    <Badge variant="outline">{option.sku_code}</Badge>
  </div>
</button>
```

#### 3. Badge Usage Pattern (Established) 
```typescript
// SKU codes with monospace styling
<Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
  {skuCode}
</Badge>
```

### Theme & Design Tokens

The component system utilizes CSS custom properties for consistent theming:

```css
/* Established color tokens */
--amber-500: #f59e0b;     /* Primary selection color */
--amber-50: #fffbeb;      /* Selection background */
--gray-50: #f9fafb;       /* Disabled background */
--gray-200: #e5e7eb;      /* Disabled border */
--gray-300: #d1d5db;      /* Hover border */
```

### Component Extension Guidelines

When creating new components or extending existing ones:

1. **Follow shadcn/ui Patterns**: Use established component structure with forwardRef and proper prop spreading
2. **Maintain Visual Consistency**: Use existing design tokens and spacing patterns (`space-y-4`, `p-4`, etc.)
3. **Implement Proper States**: Support disabled, selected, hover, and focus states consistently
4. **Include Accessibility**: Ensure proper ARIA labels and keyboard navigation
5. **Use Established Props**: Leverage className prop merging with `cn()` utility
6. **Support Responsive Behavior**: Follow mobile-first breakpoint strategy

### TypeScript Integration

All components maintain strict TypeScript interfaces:

```typescript
// Consistent prop interface pattern
interface CustomComponentProps extends React.ComponentProps<"div"> {
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
}

const CustomComponent = React.forwardRef<HTMLDivElement, CustomComponentProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
```

### Performance Considerations

The established component library follows these performance patterns:

1. **Lazy Loading**: Components load only when needed
2. **Memoization**: Complex calculations cached at component level  
3. **Event Delegation**: Efficient event handling for option selections
4. **Minimal Re-renders**: State changes isolated to affected components
5. **Bundle Optimization**: Tree-shaking enabled for unused components

**Component Reference**: Complete component implementations available in `src/components/ui/` with 47 total components supporting all configurator functionality.
