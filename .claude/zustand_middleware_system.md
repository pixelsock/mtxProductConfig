# Zustand Middleware System - Complete Reference

## Middleware Architecture

Zustand's middleware system allows extending store functionality through a compositional pattern. Middleware functions wrap the store creation process to add features like persistence, devtools integration, and state manipulation.

### Core Middleware Pattern
```typescript
// Basic middleware signature
type Middleware<T> = (
  config: StateCreator<T, [], [], T>,
  options?: MiddlewareOptions
) => StateCreator<T, [], [], T>

// Usage with multiple middleware
const useStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        // store definition
      })),
      { name: 'my-store' }
    )
  )
)
```

## Built-in Middleware Collection

### 1. Persist Middleware (`persist`)
**Purpose**: Automatic state persistence to localStorage, sessionStorage, or custom storage

```typescript
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      fishes: 0,
      addAFish: () => set({ fishes: get().fishes + 1 }),
    }),
    {
      name: 'food-storage', // unique name
      storage: createJSONStorage(() => sessionStorage), // optional
      partialize: (state) => ({ fishes: state.fishes }), // partial persist
      onRehydrateStorage: (state) => {
        console.log('hydration starts')
        return (state, error) => {
          if (error) {
            console.log('an error happened during hydration', error)
          } else {
            console.log('hydration finished')
          }
        }
      },
    }
  )
)
```

**Features**:
- Multiple storage backends (localStorage, sessionStorage, custom)
- Partial state persistence via `partialize`
- Hydration lifecycle hooks
- Version migration support
- Custom serialization/deserialization

### 2. DevTools Middleware (`devtools`)
**Purpose**: Integration with Redux DevTools browser extension

```typescript
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    (set) => ({
      bears: 0,
      increasePopulation: () => set(
        (state) => ({ bears: state.bears + 1 }),
        undefined,
        'bear/increasePopulation' // action name
      ),
    }),
    {
      name: 'bear-store', // store name in devtools
      serialize: { options: true }, // serialization options
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)
```

**Features**:
- Action logging with custom names
- Time-travel debugging
- State inspection and modification
- Multiple store connections
- Production environment toggle

### 3. Immer Middleware (`immer`)
**Purpose**: Immutable state updates using Immer draft pattern

```typescript
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  immer((set) => ({
    lush: { forest: { contains: { a: 'bear' } } },
    clearForest: () =>
      set((state) => {
        state.lush.forest.contains = null // direct mutation on draft
      }),
  }))
)
```

**Benefits**:
- Direct mutation syntax on draft objects
- Automatic immutability handling
- Nested state updates simplified
- TypeScript support with proper inference

### 4. Redux Middleware (`redux`)
**Purpose**: Redux-style reducer pattern integration

```typescript
import { redux } from 'zustand/middleware'

const types = { increase: 'INCREASE', decrease: 'DECREASE' }

const reducer = (state, { type, by = 1 }) => {
  switch (type) {
    case types.increase:
      return { grumpiness: state.grumpiness + by }
    case types.decrease:
      return { grumpiness: state.grumpiness - by }
  }
}

const useStore = create(redux(reducer, { grumpiness: 0 }))

// Usage
const dispatch = useStore((state) => state.dispatch)
dispatch({ type: types.increase, by: 2 })
```

### 5. Subscribe with Selector (`subscribeWithSelector`)
**Purpose**: Enhanced subscription capabilities with selectors

```typescript
import { subscribeWithSelector } from 'zustand/middleware'

const useStore = create(
  subscribeWithSelector(() => ({ paw: true, snout: true, fur: true }))
)

// Enhanced subscribe API
const unsubscribe = useStore.subscribe(
  (state) => state.paw, // selector
  (paw, previousPaw) => console.log(paw, previousPaw), // callback
  {
    equalityFn: shallow, // custom equality
    fireImmediately: true // immediate execution
  }
)
```

### 6. Combine Middleware (`combine`)
**Purpose**: Combine multiple store slices into one store

```typescript
import { combine } from 'zustand/middleware'

const useStore = create(
  combine(
    { bears: 0, fish: 0 }, // initial state
    (set, get) => ({
      // actions
      increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
      eatFish: () => set((state) => ({ fish: state.fish - 1 })),
    })
  )
)
```

## Middleware Composition Patterns

### Common Patterns
```typescript
// Development setup with full middleware stack
const useStore = create<StoreState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // store implementation
        }))
      ),
      { name: 'app-store' }
    ),
    { name: 'App Store' }
  )
)

// Production-optimized setup
const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // store implementation
    }),
    { name: 'app-store' }
  )
)
```

### Custom Middleware Creation
```typescript
// Logger middleware example
const logger = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('  applying', args)
      set(...args)
      console.log('  new state', get())
    },
    get,
    api
  )

const useStore = create(
  logger((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  }))
)
```

## TypeScript Integration

### Middleware Type Safety
```typescript
interface BearState {
  bears: number
  increase: (by: number) => void
}

// Proper type inference through middleware
const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      { name: 'bear-storage' }
    )
  )
)
```

The middleware system makes Zustand highly extensible while maintaining simplicity and type safety throughout the composition chain.