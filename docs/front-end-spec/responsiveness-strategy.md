# Responsiveness Strategy

## Established Responsive Design System

The MTX Product Configurator implements a **mobile-first responsive strategy** with carefully designed breakpoints optimized for product configuration workflows. This section documents the established responsive patterns to ensure consistency across future development.

### Responsive Breakpoints (Established)

The configurator uses a strategic breakpoint system that adapts to common device sizes and usage patterns:

```css
/* Tailwind CSS Breakpoint System (Established) */
/* Mobile First Approach */
@media (min-width: 640px) { /* sm: small tablets */ }
@media (min-width: 768px) { /* md: tablets */ }  
@media (min-width: 1024px) { /* lg: laptops */ }
@media (min-width: 1280px) { /* xl: desktops */ }
@media (min-width: 1536px) { /* 2xl: large screens */ }

/* Primary Layout Breakpoints */
--mobile: 320px - 767px;     /* Single column, stacked layout */
--tablet: 768px - 1023px;    /* Split layout, condensed sidebar */
--desktop: 1024px+;          /* Full split layout, expanded sidebar */
```

### Layout Adaptation Strategy

#### Mobile Layout (< 768px) - Established Pattern
```typescript
// Stacked vertical layout for mobile devices
<div className="flex flex-col space-y-6 p-4">
  {/* Product visualization first */}
  <div className="w-full">
    <ProductVisualization />
  </div>
  
  {/* Current configuration summary */}
  <div className="w-full">
    <CurrentConfigurationCard collapsed={true} />
  </div>
  
  {/* Collapsible option sections */}
  <div className="space-y-4">
    {optionSections.map(section => (
      <Collapsible key={section.id}>
        <CollapsibleTrigger className="w-full p-4 border rounded-lg">
          {section.title}
        </CollapsibleTrigger>
        <CollapsibleContent>
          {section.options}
        </CollapsibleContent>
      </Collapsible>
    ))}
  </div>
  
  {/* Sticky CTA at bottom */}
  <div className="sticky bottom-0 bg-white border-t p-4">
    <Button className="w-full">Add to Quote</Button>
  </div>
</div>
```

#### Tablet Layout (768px - 1023px) - Established Pattern
```typescript
// Split layout with adjusted proportions
<div className="grid grid-cols-5 gap-6 h-screen p-6">
  {/* Product visualization - 2/5 width */}
  <div className="col-span-2 flex flex-col space-y-4">
    <ProductVisualization />
    <SKUDisplay />
  </div>
  
  {/* Configuration options - 3/5 width */}
  <div className="col-span-3 flex flex-col space-y-6">
    <CurrentConfigurationCard />
    <div className="flex-1 overflow-y-auto">
      <DynamicOptionsContainer />
    </div>
  </div>
</div>
```

#### Desktop Layout (1024px+) - Established Pattern
```typescript
// Full split layout with optimal proportions
<div className="grid grid-cols-2 gap-8 h-screen p-8 max-w-7xl mx-auto">
  {/* Product visualization - 1/2 width */}
  <div className="flex flex-col space-y-6 sticky top-8 h-fit">
    <ProductVisualization />
    <div className="grid grid-cols-1 gap-4">
      <SKUDisplay />
      <QuoteSummaryCard />
    </div>
  </div>
  
  {/* Configuration options - 1/2 width */}
  <div className="flex flex-col space-y-8">
    <CurrentConfigurationCard />
    <div className="space-y-10">
      <DynamicOptionsContainer />
    </div>
  </div>
</div>
```

### Component Responsive Patterns

#### Dynamic Grid Systems (Established)
```css
/* Option selection grids adapt to screen size */
.option-grid {
  /* Mobile: 1 column for readability */
  @apply grid grid-cols-1 gap-4;
}

@media (min-width: 640px) {
  .option-grid {
    /* Small tablets: 2 columns for balance */
    @apply grid-cols-2;
  }
}

@media (min-width: 1024px) {
  .option-grid {
    /* Desktop: maintain 2 columns for optimal touch targets */
    @apply grid-cols-2;
  }
}

/* Color swatch grids scale differently */
.color-swatch-grid {
  @apply grid gap-3;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}
```

#### Typography Scaling (Established)
```css
/* Responsive typography system */
.heading-primary {
  @apply text-lg font-semibold;
}

@media (min-width: 768px) {
  .heading-primary {
    @apply text-xl;
  }
}

@media (min-width: 1024px) {
  .heading-primary {
    @apply text-2xl;
  }
}

/* Option labels scale with screen size */
.option-label {
  @apply text-sm font-medium;
}

@media (min-width: 1024px) {
  .option-label {
    @apply text-base;
  }
}
```

#### Spacing Adjustments (Established)
```css
/* Container padding scales with screen size */
.container-padding {
  @apply p-4;                /* Mobile: 16px */
}

@media (min-width: 768px) {
  .container-padding {
    @apply p-6;              /* Tablet: 24px */
  }
}

@media (min-width: 1024px) {
  .container-padding {
    @apply p-8;              /* Desktop: 32px */
  }
}
```

### Touch & Interaction Adaptations

#### Touch Target Optimization (Established)
```css
/* Ensure minimum 44px touch targets on mobile */
.touch-optimized {
  @apply min-h-[44px] min-w-[44px];
}

/* Larger spacing between interactive elements on touch devices */
@media (hover: none) and (pointer: coarse) {
  .option-grid {
    @apply gap-6;           /* Increased spacing for touch */
  }
  
  .button-group {
    @apply space-y-4;       /* More vertical space */
  }
}
```

#### Hover State Management (Established)
```css
/* Hover states only on devices that support hover */
@media (hover: hover) and (pointer: fine) {
  .option-button:hover {
    @apply bg-gray-50 border-gray-300;
  }
}

/* Focus states for touch and keyboard navigation */
.option-button:focus-visible {
  @apply ring-2 ring-amber-500 ring-offset-2;
}
```

### Performance-Oriented Responsive Loading

#### Image Loading Strategy (Established)
```typescript
// Responsive image loading based on device capabilities
const getImageSize = () => {
  if (window.innerWidth < 768) return 'small';    // 400px width
  if (window.innerWidth < 1024) return 'medium';  // 600px width  
  return 'large';                                 // 800px+ width
};

// Lazy loading with size selection
<img 
  src={`${baseUrl}/product-image-${getImageSize()}.jpg`}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
/>
```

#### Conditional Component Loading (Established)
```typescript
// Load mobile-specific components only when needed
const MobileOptionsPanel = lazy(() => import('./MobileOptionsPanel'));
const DesktopOptionsPanel = lazy(() => import('./DesktopOptionsPanel'));

const OptionsPanel = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {isMobile ? <MobileOptionsPanel /> : <DesktopOptionsPanel />}
    </Suspense>
  );
};
```

### Testing Strategy for Responsiveness

The established responsive design has been tested across:

1. **Device Categories**:
   - Mobile phones: 320px - 480px width
   - Small tablets: 481px - 768px width  
   - Large tablets: 769px - 1024px width
   - Laptops: 1025px - 1440px width
   - Desktop: 1441px+ width

2. **Orientation Testing**:
   - Portrait and landscape modes for tablets
   - Rotation handling for mobile devices
   - Dynamic layout adjustment

3. **Browser Testing**:
   - Safari iOS (mobile/tablet)
   - Chrome Android (mobile/tablet)
   - Desktop browsers (Chrome, Firefox, Safari, Edge)

### Responsive Development Guidelines

When extending responsive functionality:

1. **Mobile-First Approach**: Design and code for mobile first, enhance for larger screens
2. **Content Priority**: Ensure critical functionality available at all screen sizes  
3. **Touch Optimization**: Maintain 44px minimum touch targets
4. **Performance Consideration**: Use appropriate image sizes and lazy loading
5. **Testing Requirements**: Verify functionality across all established breakpoints

#### Responsive Design Checklist
- [ ] Layout adapts gracefully from 320px to 1920px+ width
- [ ] Touch targets meet 44px minimum requirement
- [ ] Typography remains readable at all sizes
- [ ] Images load appropriate sizes for device capabilities
- [ ] Navigation remains accessible across all breakpoints
- [ ] Critical functionality available without horizontal scrolling

**Responsive Reference**: Complete responsive patterns implemented in `src/App.tsx` with TailwindCSS responsive utilities. Mobile-first strategy established throughout component library.
