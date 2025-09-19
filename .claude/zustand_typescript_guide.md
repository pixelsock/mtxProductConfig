# Zustand TypeScript Integration Guide

## Basic TypeScript Setup

### Simple Store Definition
```typescript
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
}

// Note the empty () after create<BearState>
const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))
```

### Why the Double Function Call?
The `create<BearState>()()` pattern is required for proper TypeScript inference when using middleware. The first call establishes the type, the second call provides the implementation.

## Advanced TypeScript Patterns

### 1. Store with Computed Properties
```typescript
interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  // Computed properties
  isEven: boolean
  doubled: number
}

const useCounterStore = create<CounterState>()((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),

  // Getters for computed values
  get isEven() {
    return get().count % 2 === 0
  },
  get doubled() {
    return get().count * 2
  },
}))
```

### 2. Store Slices Pattern
```typescript
// Fish slice
interface FishSlice {
  fishes: number
  addFish: () => void
}

const createFishSlice: StateCreator<
  FishSlice & BearSlice,
  [],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
})

// Bear slice
interface BearSlice {
  bears: number
  addBear: () => void
  eatFish: () => void
}

const createBearSlice: StateCreator<
  FishSlice & BearSlice,
  [],
  [],
  BearSlice
> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  eatFish: () => set((state) => ({ fishes: state.fishes - 1 })),
})

// Combined store
const useStore = create<FishSlice & BearSlice>()((...a) => ({
  ...createFishSlice(...a),
  ...createBearSlice(...a),
}))
```

### 3. Middleware with TypeScript
```typescript
import { devtools, persist } from 'zustand/middleware'
import type {} from '@redux-devtools/extension' // Required for devtools typing

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      {
        name: 'bear-storage',
        // Persist only specific fields
        partialize: (state) => ({ bears: state.bears }),
      }
    ),
    {
      name: 'bear-store', // DevTools store name
    }
  )
)
```

## Advanced Type Patterns

### 1. Generic Store Factory
```typescript
interface BaseState<T> {
  data: T[]
  add: (item: T) => void
  remove: (id: string) => void
  getById: (id: string) => T | undefined
}

function createListStore<T extends { id: string }>() {
  return create<BaseState<T>>()((set, get) => ({
    data: [],
    add: (item) => set((state) => ({ data: [...state.data, item] })),
    remove: (id) => set((state) => ({
      data: state.data.filter((item) => item.id !== id)
    })),
    getById: (id) => get().data.find((item) => item.id === id),
  }))
}

// Usage with specific types
interface User {
  id: string
  name: string
  email: string
}

const useUserStore = createListStore<User>()
```

### 2. Action Types for Better IntelliSense
```typescript
interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
}

interface TodoActions {
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  setFilter: (filter: TodoState['filter']) => void
  clearCompleted: () => void
}

type TodoStore = TodoState & TodoActions

const useTodoStore = create<TodoStore>()((set) => ({
  // State
  todos: [],
  filter: 'all',

  // Actions
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now().toString(), text, completed: false }]
  })),

  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  })),

  setFilter: (filter) => set({ filter }),

  clearCompleted: () => set((state) => ({
    todos: state.todos.filter((todo) => !todo.completed)
  })),
}))
```

### 3. Custom Selectors with TypeScript
```typescript
// Selector function types
type BearSelector<T> = (state: BearState) => T

// Custom hook with type safety
function useBearSelector<T>(selector: BearSelector<T>) {
  return useBearStore(selector)
}

// Usage with full type inference
const bears = useBearSelector((state) => state.bears) // number
const increase = useBearSelector((state) => state.increase) // (by: number) => void
```

## Middleware Type Definitions

### 1. Custom Middleware Types
```typescript
import type { StateCreator } from 'zustand'

// Logger middleware with types
type Logger = <T>(
  config: StateCreator<T, [], [], T>,
  options?: { prefix?: string }
) => StateCreator<T, [], [], T>

const logger: Logger = (config, options = {}) => (set, get, api) =>
  config(
    (...args) => {
      console.log(`${options.prefix || 'LOG'}:`, args)
      set(...args)
    },
    get,
    api
  )

// Usage
const useStore = create<BearState>()(
  logger(
    (set) => ({
      bears: 0,
      increase: (by) => set((state) => ({ bears: state.bears + by })),
    }),
    { prefix: 'BEAR_STORE' }
  )
)
```

### 2. Persist Middleware with Custom Storage
```typescript
import type { PersistOptions, StorageValue } from 'zustand/middleware'

interface CustomStorage<T> {
  getItem: (name: string) => T | null | Promise<T | null>
  setItem: (name: string, value: T) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
}

const customStorage: CustomStorage<string> = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => localStorage.setItem(name, value),
  removeItem: (name) => localStorage.removeItem(name),
}

const useStore = create<BearState>()(
  persist(
    (set) => ({
      bears: 0,
      increase: (by) => set((state) => ({ bears: state.bears + by })),
    }),
    {
      name: 'bear-storage',
      storage: {
        getItem: (name) => {
          const str = customStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          customStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => customStorage.removeItem(name),
      },
    } satisfies PersistOptions<BearState>
  )
)
```

## Error Handling and Type Guards

### 1. Safe State Access
```typescript
interface AppState {
  user: User | null
  isLoading: boolean
  error: string | null
}

const useAppStore = create<AppState>()((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user: User) => set({ user, error: null }),
  setError: (error: string) => set({ error, isLoading: false }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}))

// Type guard for user existence
function useRequireUser() {
  const user = useAppStore((state) => state.user)
  if (!user) {
    throw new Error('User is required')
  }
  return user // TypeScript knows this is User, not User | null
}
```

### 2. Discriminated Unions
```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

interface DataState {
  posts: AsyncState<Post[]>
  loadPosts: () => Promise<void>
}

const useDataStore = create<DataState>()((set) => ({
  posts: { status: 'idle' },

  loadPosts: async () => {
    set({ posts: { status: 'loading' } })
    try {
      const data = await fetchPosts()
      set({ posts: { status: 'success', data } })
    } catch (error) {
      set({ posts: { status: 'error', error: error.message } })
    }
  },
}))

// Usage with type narrowing
function PostList() {
  const posts = useDataStore((state) => state.posts)

  switch (posts.status) {
    case 'idle':
      return <div>Click to load posts</div>
    case 'loading':
      return <div>Loading...</div>
    case 'success':
      return <div>{posts.data.length} posts loaded</div> // data is typed as Post[]
    case 'error':
      return <div>Error: {posts.error}</div> // error is typed as string
  }
}
```

This comprehensive TypeScript integration ensures full type safety while maintaining Zustand's simplicity and performance benefits.