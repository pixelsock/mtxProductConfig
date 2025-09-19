# Zustand React Integration Patterns

## Core React Hooks and Patterns

### Basic Hook Usage
```typescript
import { create } from 'zustand'

// Store definition
const useBearStore = create((set, get) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))

// Component usage
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  const increasePopulation = useBearStore((state) => state.increasePopulation)

  return (
    <div>
      <h1>{bears} around here...</h1>
      <button onClick={increasePopulation}>Add bear</button>
    </div>
  )
}
```

## State Selection Strategies

### 1. Single Property Selection
```typescript
// Most efficient - only re-renders when bears changes
const bears = useBearStore((state) => state.bears)
const honey = useBearStore((state) => state.honey)
```

### 2. Multiple Property Selection with useShallow
```typescript
import { useShallow } from 'zustand/react/shallow'

// Object destructuring - prevents unnecessary re-renders
const { nuts, honey } = useBearStore(
  useShallow((state) => ({ nuts: state.nuts, honey: state.honey }))
)

// Array destructuring
const [nuts, honey] = useBearStore(
  useShallow((state) => [state.nuts, state.honey])
)

// Mapped picks for computed values
const treats = useBearStore(
  useShallow((state) => Object.keys(state.treats))
)
```

### 3. Custom Equality Functions
```typescript
import { createWithEqualityFn } from 'zustand/traditional'

const useStore = createWithEqualityFn(/* store definition */)

// Custom comparison for complex objects
const treats = useStore(
  (state) => state.treats,
  (oldTreats, newTreats) => deepEqual(oldTreats, newTreats)
)
```

### 4. Fetching Entire State (Use Sparingly)
```typescript
// Will re-render on every state change - use carefully
const state = useBearStore()
```

## Advanced React Patterns

### 1. Transient Updates for Performance
```typescript
const Component = () => {
  const scratchRef = useRef(useScratchStore.getState().scratches)

  // Subscribe without causing re-renders
  useEffect(() => {
    const unsubscribe = useScratchStore.subscribe(
      (state) => {
        scratchRef.current = state.scratches
        // Update DOM directly for high-frequency updates
        if (canvasRef.current) {
          canvasRef.current.style.opacity = state.scratches / 100
        }
      }
    )
    return unsubscribe
  }, [])

  return <canvas ref={canvasRef} />
}
```

### 2. Conditional Subscriptions
```typescript
function OptionalDisplay({ shouldTrack }) {
  // Only subscribe when needed
  const value = shouldTrack
    ? useBearStore((state) => state.expensiveComputation())
    : null

  return shouldTrack ? <div>{value}</div> : <div>Tracking disabled</div>
}
```

### 3. Derived State Patterns
```typescript
const useBearStore = create((set, get) => ({
  bears: 0,
  fish: 0,

  // Computed values
  get totalAnimals() {
    return get().bears + get().fish
  },

  // Or as functions
  getTotalAnimals: () => {
    const { bears, fish } = get()
    return bears + fish
  }
}))

// Usage in components
function Statistics() {
  const totalAnimals = useBearStore((state) => state.totalAnimals)
  // or
  const getTotalAnimals = useBearStore((state) => state.getTotalAnimals)
  const total = getTotalAnimals()

  return <div>Total: {totalAnimals}</div>
}
```

## React Context Integration

### Using Vanilla Stores with Context
```typescript
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'

// Create vanilla store
const store = createStore((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}))

// Context setup
const StoreContext = createContext(null)

function App() {
  return (
    <StoreContext.Provider value={store}>
      <BearCounter />
    </StoreContext.Provider>
  )
}

function BearCounter() {
  const store = useContext(StoreContext)
  const bears = useStore(store, (state) => state.bears)
  const increasePopulation = useStore(store, (state) => state.increasePopulation)

  return (
    <div>
      <span>{bears} bears</span>
      <button onClick={increasePopulation}>Add bear</button>
    </div>
  )
}
```

### Store Initialization with Props
```typescript
function createBearStore(initialBears = 0) {
  return createStore((set) => ({
    bears: initialBears,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  }))
}

function BearProvider({ children, initialBears }) {
  const store = useMemo(() => createBearStore(initialBears), [initialBears])

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  )
}
```

## SSR and Hydration Patterns

### Next.js Integration
```typescript
// pages/_app.js
import { useBearStore } from '../stores/bearStore'

function MyApp({ Component, pageProps }) {
  // Initialize store on client
  useEffect(() => {
    useBearStore.persist.rehydrate()
  }, [])

  return <Component {...pageProps} />
}
```

### Hydration-Safe Store Creation
```typescript
const useBearStore = create((set) => ({
  bears: 0,
  hasHydrated: false,

  // Mark hydration complete
  setHasHydrated: (state) => set({ hasHydrated: state }),

  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}))

// Hook for hydration status
function useHasHydrated() {
  return useBearStore((state) => state.hasHydrated)
}

// Component with hydration guard
function BearCounter() {
  const hasHydrated = useHasHydrated()
  const bears = useBearStore((state) => state.bears)

  // Prevent hydration mismatch
  if (!hasHydrated) {
    return <div>Loading...</div>
  }

  return <div>{bears} bears</div>
}
```

## Testing Patterns

### Store Testing Setup
```typescript
import { act, renderHook } from '@testing-library/react'

// Mock store for testing
function createTestStore() {
  return create((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  }))
}

test('should increase bear population', () => {
  const { result } = renderHook(() => createTestStore())

  act(() => {
    result.current.getState().increasePopulation()
  })

  expect(result.current.getState().bears).toBe(1)
})
```

### Component Testing with Store
```typescript
import { render, screen, fireEvent } from '@testing-library/react'

// Reset store between tests
beforeEach(() => {
  useBearStore.setState({ bears: 0 })
})

test('displays bear count', () => {
  render(<BearCounter />)
  expect(screen.getByText('0 around here...')).toBeInTheDocument()

  fireEvent.click(screen.getByText('one up'))
  expect(screen.getByText('1 around here...')).toBeInTheDocument()
})
```

These patterns provide comprehensive coverage for integrating Zustand effectively with React applications while maintaining performance and type safety.