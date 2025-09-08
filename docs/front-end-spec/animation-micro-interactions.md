# Animation & Micro-Interactions

## Established Animation System

The MTX Product Configurator employs **subtle, purposeful animations** that enhance usability without distraction. The established animation system prioritizes performance and accessibility while providing clear feedback for user interactions.

### Animation Philosophy (Established)

The configurator follows these animation principles:

1. **Functional Animation**: Every animation serves a purpose (feedback, guidance, or state indication)
2. **Subtle & Professional**: Animations are understated to maintain the technical aesthetic
3. **Performance First**: All animations are GPU-accelerated and respect reduced motion preferences
4. **Accessibility Compliant**: Motions can be disabled via `prefers-reduced-motion`

### Transition System (Established)

The configurator uses a consistent transition timing system:

```css
/* Standard Transition Timings (Established) */
--transition-fast: 150ms;        /* Hover states, immediate feedback */
--transition-normal: 250ms;      /* Selection states, focus changes */
--transition-slow: 350ms;        /* Layout changes, modal openings */

/* Easing Functions */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);       /* Default ease-out */
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);    /* Smooth bidirectional */
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* Playful bounce */
```

### Interactive Element Animations (Established)

#### Option Selection Animations
```css
/* Option button state transitions */
.option-button {
  transition: all 150ms cubic-bezier(0.0, 0.0, 0.2, 1);
  transform: translateY(0);
}

.option-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.option-button.selected {
  transform: scale(1.02);
  transition: all 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

#### Color Swatch Animations (Established)
```css
/* Color swatch selection with scale animation */
.color-swatch {
  transition: all 150ms ease-out;
  transform: scale(1);
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--color-value);
}

.color-swatch.selected {
  transform: scale(1.15);
  box-shadow: 0 0 0 3px white, 0 0 0 6px #f59e0b;
}
```

#### Button Interaction Animations (Established)
```css
/* Primary button animations */
.btn-primary {
  transition: all 150ms ease-out;
  transform: translateY(0);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px -2px rgb(245 158 11 / 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  transition-duration: 75ms;
}
```

### Loading & State Change Animations (Established)

#### Configuration Loading States
```css
/* Skeleton loading animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0.0, 0.6, 1) infinite;
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.loading-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}
```

#### Option Availability Changes
```typescript
// Smooth transition when options become available/unavailable
const OptionButton = ({ disabled, children, ...props }) => (
  <button
    className={`
      transition-all duration-300 ease-in-out
      ${disabled 
        ? 'opacity-50 grayscale cursor-not-allowed' 
        : 'opacity-100 grayscale-0 hover:scale-105'
      }
    `}
    {...props}
  >
    {children}
  </button>
);
```

### Modal & Overlay Animations (Established)

#### Lightbox Modal Animation
```css
/* Modal backdrop fade-in */
.modal-backdrop {
  opacity: 0;
  transition: opacity 250ms ease-out;
}

.modal-backdrop.open {
  opacity: 1;
}

/* Modal content slide-in with scale */
.modal-content {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
  transition: all 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.modal-content.open {
  transform: scale(1) translateY(0);
  opacity: 1;
}
```

#### Thumbnail Gallery Animations
```css
/* Smooth thumbnail scrolling */
.thumbnail-container {
  scroll-behavior: smooth;
  transition: transform 300ms ease-out;
}

/* Thumbnail selection animation */
.thumbnail {
  transition: all 200ms ease-out;
  border: 2px solid transparent;
  transform: scale(1);
}

.thumbnail.active {
  border-color: #f59e0b;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.1);
}
```

### Real-time Feedback Animations (Established)

#### SKU Update Animation
```typescript
// Animated SKU change with highlight effect
const SkuDisplay = ({ sku, isChanging }) => (
  <div className={`
    transition-all duration-200 
    ${isChanging ? 'bg-amber-50 scale-105' : 'bg-white scale-100'}
    border rounded-lg p-3
  `}>
    <span className="font-mono text-sm">{sku}</span>
  </div>
);
```

#### Configuration Summary Updates
```css
/* Smooth height transitions for expanding content */
.config-summary {
  transition: height 300ms ease-in-out;
  overflow: hidden;
}

/* Individual configuration items fade in */
.config-item {
  opacity: 0;
  transform: translateX(-10px);
  animation: slideInFade 250ms ease-out forwards;
}

@keyframes slideInFade {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Performance & Accessibility Considerations

#### Reduced Motion Support (Established)
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Keep essential feedback animations but make them instantaneous */
  .option-button.selected {
    transform: none;
    transition: none;
  }
}
```

#### GPU Acceleration (Established)
```css
/* Force hardware acceleration for smooth animations */
.animated-element {
  will-change: transform;
  transform: translateZ(0);
}

/* Remove will-change after animation completes */
.animation-complete {
  will-change: auto;
}
```

### Animation Guidelines for Future Development

When adding new animations:

1. **Purpose-Driven**: Every animation should serve a functional purpose
2. **Performance First**: Use transform and opacity for GPU acceleration
3. **Timing Consistency**: Use established transition timing values
4. **Accessibility**: Always provide reduced-motion alternatives
5. **Testing**: Verify smooth performance on lower-end devices

#### Animation Implementation Checklist
- [ ] Animation serves a clear functional purpose
- [ ] Uses GPU-accelerated properties (transform, opacity)
- [ ] Respects `prefers-reduced-motion` settings
- [ ] Duration appropriate for the interaction (150ms-350ms)
- [ ] Tested across different device capabilities
- [ ] Fallback behavior defined for older browsers

**Animation Reference**: All animations implemented with CSS transitions and React state management. Performance optimized with GPU acceleration and accessibility compliance.
