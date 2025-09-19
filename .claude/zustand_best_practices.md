# Zustand Best Practices and Advanced Patterns

## Store Organization and Structure

### 1. Single Store vs Multiple Stores
```typescript
// ✅ GOOD: Single store with logical grouping
interface AppStore {
  // User state
  user: User | null
  isAuthenticated: boolean
  login: (credentials: Credentials) => Promise<void>
  logout: () => void

  // UI state
  theme: 'light' | 'dark'
  sidebar: { isOpen: boolean; width: number }
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void

  // Data state
  posts: Post[]
  loadPosts: () => Promise<void>
  addPost: (post: Post) => void
}

// ❌ AVOID: Too many separate stores for related data
const useUserStore = create(...)
const useThemeStore = create(...)
const usePostStore = create(...)
const useSidebarStore = create(...)
```

### 2. Store Slicing Pattern
```typescript
// Slice interfaces
interface UserSlice {
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

interface ThemeSlice {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

interface PostSlice {
  posts: Post[]
  loadPosts: () => Promise<void>
  addPost: (post: Post) => void
}

// Slice creators
const createUserSlice: StateCreator<
  UserSlice & ThemeSlice & PostSlice,
  [],
  [],
  UserSlice
> = (set, get) => ({
  user: null,
  login: async (credentials) => {
    const user = await authService.login(credentials)
    set({ user })
  },
  logout: () => set({ user: null }),
})

const createThemeSlice: StateCreator<
  UserSlice & ThemeSlice & PostSlice,
  [],
  [],
  ThemeSlice
> = (set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
})

const createPostSlice: StateCreator<
  UserSlice & ThemeSlice & PostSlice,
  [],
  [],
  PostSlice
> = (set, get) => ({
  posts: [],
  loadPosts: async () => {
    const posts = await apiService.getPosts()
    set({ posts })
  },
  addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
})

// Combined store
export const useAppStore = create<UserSlice & ThemeSlice & PostSlice>()(
  (...a) => ({
    ...createUserSlice(...a),
    ...createThemeSlice(...a),
    ...createPostSlice(...a),
  })
)
```

## Performance Optimization Patterns

### 1. Granular Selectors
```typescript
// ✅ GOOD: Specific selectors
const userName = useAppStore((state) => state.user?.name)
const isAuthenticated = useAppStore((state) => !!state.user)
const theme = useAppStore((state) => state.theme)

// ❌ AVOID: Overly broad selectors
const { user, theme, posts } = useAppStore((state) => state) // Re-renders on any change
```

### 2. Memoized Selectors for Complex Computations
```typescript
import { useMemo } from 'react'

// Custom hook for expensive computations
function useFilteredPosts(filter: string) {
  const posts = useAppStore((state) => state.posts)

  return useMemo(() => {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(filter.toLowerCase())
    )
  }, [posts, filter])
}

// Or store the computation in the store
const useAppStore = create((set, get) => ({
  posts: [],
  searchTerm: '',

  setSearchTerm: (term: string) => set({ searchTerm: term }),

  get filteredPosts() {
    const { posts, searchTerm } = get()
    if (!searchTerm) return posts
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  },
}))
```

### 3. Subscription for Non-UI Updates
```typescript
// For analytics, logging, or other side effects
useEffect(() => {
  const unsubscribe = useAppStore.subscribe(
    (state) => state.user,
    (user, previousUser) => {
      if (user && !previousUser) {
        analytics.track('user_logged_in', { userId: user.id })
      }
    }
  )
  return unsubscribe
}, [])
```

## State Management Patterns

### 1. Immutable Updates
```typescript
// ✅ GOOD: Immutable patterns
const useTaskStore = create((set) => ({
  tasks: [],

  addTask: (task: Task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id: string, updates: Partial<Task>) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  removeTask: (id: string) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
}))

// ❌ AVOID: Direct mutations
const badStore = create((set, get) => ({
  tasks: [],

  addTask: (task: Task) => {
    const tasks = get().tasks
    tasks.push(task) // Direct mutation
    set({ tasks })
  },
}))
```

### 2. Async Actions with Proper Error Handling
```typescript
interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

const useDataStore = create<{
  posts: AsyncState<Post[]>
  loadPosts: () => Promise<void>
}>((set) => ({
  posts: { data: null, loading: false, error: null },

  loadPosts: async () => {
    set((state) => ({
      posts: { ...state.posts, loading: true, error: null }
    }))

    try {
      const data = await apiService.getPosts()
      set((state) => ({
        posts: { data, loading: false, error: null }
      }))
    } catch (error) {
      set((state) => ({
        posts: {
          ...state.posts,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    }
  },
}))
```

### 3. Optimistic Updates
```typescript
const usePostStore = create((set, get) => ({
  posts: [],

  addPostOptimistic: async (postData: Omit<Post, 'id'>) => {
    const optimisticPost: Post = {
      id: `temp-${Date.now()}`,
      ...postData,
      isPending: true,
    }

    // Immediately add to UI
    set((state) => ({ posts: [...state.posts, optimisticPost] }))

    try {
      const savedPost = await apiService.createPost(postData)

      // Replace optimistic post with real post
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === optimisticPost.id ? savedPost : post
        ),
      }))
    } catch (error) {
      // Remove optimistic post on failure
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== optimisticPost.id),
      }))
      throw error
    }
  },
}))
```

## Testing Strategies

### 1. Store Testing
```typescript
import { act, renderHook } from '@testing-library/react'
import { useAppStore } from './store'

describe('AppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      user: null,
      posts: [],
      theme: 'light',
    })
  })

  it('should login user', async () => {
    const { result } = renderHook(() => useAppStore())

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' })
    })

    expect(result.current.user).toEqual(
      expect.objectContaining({ email: 'test@example.com' })
    )
  })

  it('should handle login failure', async () => {
    const { result } = renderHook(() => useAppStore())

    await act(async () => {
      try {
        await result.current.login({ email: 'invalid', password: 'invalid' })
      } catch (error) {
        // Expected to fail
      }
    })

    expect(result.current.user).toBeNull()
  })
})
```

### 2. Component Testing with Store
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAppStore } from './store'
import { UserProfile } from './UserProfile'

// Mock store for testing
const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' }

describe('UserProfile', () => {
  beforeEach(() => {
    useAppStore.setState({ user: mockUser })
  })

  it('displays user information', () => {
    render(<UserProfile />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('handles logout', async () => {
    const logoutSpy = jest.spyOn(useAppStore.getState(), 'logout')

    render(<UserProfile />)
    fireEvent.click(screen.getByText('Logout'))

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalled()
    })
  })
})
```

## Production Considerations

### 1. DevTools Configuration
```typescript
const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // store implementation
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          // Only persist necessary data
          user: state.user,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'App Store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)
```

### 2. Error Boundaries for Store Errors
```typescript
import React from 'react'

class StoreErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Store error:', error, errorInfo)
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>
    }

    return this.props.children
  }
}

// Wrap app with error boundary
function App() {
  return (
    <StoreErrorBoundary>
      <AppContent />
    </StoreErrorBoundary>
  )
}
```

### 3. Store Cleanup
```typescript
// For memory management in long-running apps
const useAppStore = create((set) => ({
  // store state

  reset: () => set({
    // Reset to initial state
    user: null,
    posts: [],
    theme: 'light',
  }),

  cleanup: () => {
    // Clean up subscriptions, timers, etc.
    clearInterval(get().pollingInterval)
    set({ pollingInterval: null })
  },
}))

// Cleanup on app unmount
useEffect(() => {
  return () => {
    useAppStore.getState().cleanup()
  }
}, [])
```

These patterns ensure scalable, maintainable, and performant Zustand implementations in production applications.