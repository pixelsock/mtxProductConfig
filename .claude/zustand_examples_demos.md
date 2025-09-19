# Zustand Examples and Code Demonstrations

## Real-World Implementation Examples

### 1. Todo Application with Advanced Features
```typescript
interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

interface TodoFilter {
  status: 'all' | 'active' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  search: string
}

interface TodoStore {
  todos: Todo[]
  filter: TodoFilter

  // Actions
  addTodo: (text: string, priority?: Todo['priority']) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  updateTodo: (id: string, updates: Partial<Pick<Todo, 'text' | 'priority'>>) => void
  clearCompleted: () => void

  // Filters
  setFilter: (filter: Partial<TodoFilter>) => void

  // Computed properties
  get filteredTodos(): Todo[]
  get stats(): { total: number; active: number; completed: number }
}

const useTodoStore = create<TodoStore>()((set, get) => ({
  todos: [],
  filter: { status: 'all', search: '' },

  addTodo: (text, priority = 'medium') => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({ todos: [...state.todos, newTodo] }))
  },

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      ),
    })),

  clearCompleted: () =>
    set((state) => ({
      todos: state.todos.filter((todo) => !todo.completed),
    })),

  setFilter: (newFilter) =>
    set((state) => ({
      filter: { ...state.filter, ...newFilter },
    })),

  get filteredTodos() {
    const { todos, filter } = get()

    return todos.filter((todo) => {
      // Status filter
      if (filter.status === 'active' && todo.completed) return false
      if (filter.status === 'completed' && !todo.completed) return false

      // Priority filter
      if (filter.priority && todo.priority !== filter.priority) return false

      // Search filter
      if (filter.search && !todo.text.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }

      return true
    })
  },

  get stats() {
    const { todos } = get()
    return {
      total: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length,
    }
  },
}))

// Component usage
function TodoApp() {
  const { filteredTodos, addTodo, toggleTodo, deleteTodo, stats } = useTodoStore()
  const [newTodoText, setNewTodoText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodoText.trim()) {
      addTodo(newTodoText)
      setNewTodoText('')
    }
  }

  return (
    <div>
      <h1>Todos ({stats.active} active, {stats.completed} completed)</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo..."
        />
        <button type="submit">Add</button>
      </form>

      <div>
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

### 2. Shopping Cart with Persistence
```typescript
interface Product {
  id: string
  name: string
  price: number
  image: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void

  // Computed properties
  get total(): number
  get itemCount(): number
  get subtotal(): number
  get tax(): number
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { product, quantity: 1 }],
          }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product.id !== productId),
            }
          }

          return {
            items: state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          }
        }),

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      get itemCount() {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      get tax() {
        return get().subtotal * 0.08 // 8% tax
      },

      get total() {
        return get().subtotal + get().tax
      },
    }),
    {
      name: 'shopping-cart',
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
)

// Hook for cart badge
function useCartBadge() {
  return useCartStore((state) => state.itemCount)
}

// Cart component
function ShoppingCart() {
  const { items, isOpen, total, removeItem, updateQuantity, toggleCart } = useCartStore()

  if (!isOpen) return null

  return (
    <div className="cart-sidebar">
      <div className="cart-header">
        <h3>Shopping Cart</h3>
        <button onClick={toggleCart}>×</button>
      </div>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.product.id} className="cart-item">
            <img src={item.product.image} alt={item.product.name} />
            <div>
              <h4>{item.product.name}</h4>
              <p>${item.product.price}</p>
            </div>
            <div className="quantity-controls">
              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                +
              </button>
            </div>
            <button onClick={() => removeItem(item.product.id)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="total">Total: ${total.toFixed(2)}</div>
        <button className="checkout-btn">Checkout</button>
      </div>
    </div>
  )
}
```

### 3. Form Management with Validation
```typescript
interface FormField<T = any> {
  value: T
  error: string | null
  touched: boolean
}

interface ContactForm {
  name: FormField<string>
  email: FormField<string>
  message: FormField<string>
  newsletter: FormField<boolean>
}

interface FormStore {
  fields: ContactForm
  isSubmitting: boolean
  submitStatus: 'idle' | 'success' | 'error'

  // Actions
  setField: <K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K]['value']
  ) => void
  touchField: (field: keyof ContactForm) => void
  validateField: (field: keyof ContactForm) => void
  validateAll: () => boolean
  submitForm: () => Promise<void>
  reset: () => void

  // Computed
  get isValid(): boolean
  get hasErrors(): boolean
}

const validators = {
  name: (value: string) => {
    if (!value.trim()) return 'Name is required'
    if (value.length < 2) return 'Name must be at least 2 characters'
    return null
  },

  email: (value: string) => {
    if (!value.trim()) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email'
    return null
  },

  message: (value: string) => {
    if (!value.trim()) return 'Message is required'
    if (value.length < 10) return 'Message must be at least 10 characters'
    return null
  },
}

const initialFields: ContactForm = {
  name: { value: '', error: null, touched: false },
  email: { value: '', error: null, touched: false },
  message: { value: '', error: null, touched: false },
  newsletter: { value: false, error: null, touched: false },
}

const useFormStore = create<FormStore>()((set, get) => ({
  fields: initialFields,
  isSubmitting: false,
  submitStatus: 'idle',

  setField: (field, value) =>
    set((state) => ({
      fields: {
        ...state.fields,
        [field]: {
          ...state.fields[field],
          value,
          error: null, // Clear error on change
        },
      },
    })),

  touchField: (field) =>
    set((state) => ({
      fields: {
        ...state.fields,
        [field]: {
          ...state.fields[field],
          touched: true,
        },
      },
    })),

  validateField: (field) => {
    const { fields } = get()
    const validator = validators[field as keyof typeof validators]

    if (!validator) return

    const error = validator(fields[field].value)

    set((state) => ({
      fields: {
        ...state.fields,
        [field]: {
          ...state.fields[field],
          error,
        },
      },
    }))
  },

  validateAll: () => {
    const { fields } = get()
    let isValid = true

    Object.keys(validators).forEach((field) => {
      const validator = validators[field as keyof typeof validators]
      const error = validator(fields[field as keyof ContactForm].value)

      if (error) {
        isValid = false
        set((state) => ({
          fields: {
            ...state.fields,
            [field]: {
              ...state.fields[field as keyof ContactForm],
              error,
              touched: true,
            },
          },
        }))
      }
    })

    return isValid
  },

  submitForm: async () => {
    const { validateAll, fields } = get()

    if (!validateAll()) return

    set({ isSubmitting: true, submitStatus: 'idle' })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Submit form data
      const formData = {
        name: fields.name.value,
        email: fields.email.value,
        message: fields.message.value,
        newsletter: fields.newsletter.value,
      }

      console.log('Submitting:', formData)

      set({
        isSubmitting: false,
        submitStatus: 'success',
        fields: initialFields // Reset form
      })
    } catch (error) {
      set({
        isSubmitting: false,
        submitStatus: 'error'
      })
    }
  },

  reset: () =>
    set({
      fields: initialFields,
      isSubmitting: false,
      submitStatus: 'idle',
    }),

  get isValid() {
    const { fields } = get()
    return Object.values(fields).every((field) => !field.error)
  },

  get hasErrors() {
    const { fields } = get()
    return Object.values(fields).some((field) => field.error)
  },
}))

// Form component
function ContactForm() {
  const {
    fields,
    isSubmitting,
    submitStatus,
    setField,
    touchField,
    validateField,
    submitForm,
    reset,
  } = useFormStore()

  const handleBlur = (field: keyof ContactForm) => {
    touchField(field)
    validateField(field)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitForm()
  }

  if (submitStatus === 'success') {
    return (
      <div className="success-message">
        <h3>Thank you!</h3>
        <p>Your message has been sent successfully.</p>
        <button onClick={reset}>Send another message</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={fields.name.value}
          onChange={(e) => setField('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          className={fields.name.error ? 'error' : ''}
        />
        {fields.name.touched && fields.name.error && (
          <span className="error-message">{fields.name.error}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={fields.email.value}
          onChange={(e) => setField('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          className={fields.email.error ? 'error' : ''}
        />
        {fields.email.touched && fields.email.error && (
          <span className="error-message">{fields.email.error}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={fields.message.value}
          onChange={(e) => setField('message', e.target.value)}
          onBlur={() => handleBlur('message')}
          className={fields.message.error ? 'error' : ''}
        />
        {fields.message.touched && fields.message.error && (
          <span className="error-message">{fields.message.error}</span>
        )}
      </div>

      <div className="form-field">
        <label>
          <input
            type="checkbox"
            checked={fields.newsletter.value}
            onChange={(e) => setField('newsletter', e.target.checked)}
          />
          Subscribe to newsletter
        </label>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>

      {submitStatus === 'error' && (
        <div className="error-message">
          Failed to send message. Please try again.
        </div>
      )}
    </form>
  )
}
```

These examples demonstrate real-world Zustand usage patterns including complex state management, persistence, validation, and computed properties while maintaining clean, readable code structure.