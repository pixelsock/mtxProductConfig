import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type {
  ProductLine,
  Product,
  ConfigurationState,
  ServiceResult
} from '../services/types/ServiceTypes';

// Services
import { ConfigurationService } from '../services/core/ConfigurationService';
import { ProductLineService } from '../services/core/ProductLineService';
import { RulesEngineService } from '../services/core/RulesEngineService';
import { SkuBuilderService } from '../services/core/SkuBuilderService';
import { UIConfigurationService } from '../services/ui/UIConfigurationService';
import { ProductService } from '../services/data/ProductService';
import { ImageService } from '../services/data/ImageService';

// Global App State
interface AppState {
  // Initialization
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Services
  services: {
    configuration: ConfigurationService;
    productLine: ProductLineService;
    rules: RulesEngineService;
    skuBuilder: SkuBuilderService;
    uiConfiguration: UIConfigurationService;
    products: ProductService;
    images: ImageService;
  };

  // Data
  availableProductLines: ProductLine[];
  currentProduct: Product | null;
  
  // UI State
  showQuoteForm: boolean;
  showFloatingBar: boolean;
  isLightboxOpen: boolean;
  lightboxIndex: number;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_PRODUCT_LINES'; payload: ProductLine[] }
  | { type: 'SET_CURRENT_PRODUCT'; payload: Product | null }
  | { type: 'SET_QUOTE_FORM'; payload: boolean }
  | { type: 'SET_FLOATING_BAR'; payload: boolean }
  | { type: 'SET_LIGHTBOX'; payload: { open: boolean; index?: number } };

const initialState: AppState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  services: {
    configuration: new ConfigurationService(),
    productLine: new ProductLineService(),
    rules: new RulesEngineService(),
    skuBuilder: new SkuBuilderService(),
    uiConfiguration: new UIConfigurationService(),
    products: new ProductService(),
    images: new ImageService(),
  },
  availableProductLines: [],
  currentProduct: null,
  showQuoteForm: false,
  showFloatingBar: false,
  isLightboxOpen: false,
  lightboxIndex: 0,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'SET_PRODUCT_LINES':
      return { ...state, availableProductLines: action.payload };
    
    case 'SET_CURRENT_PRODUCT':
      return { ...state, currentProduct: action.payload };
    
    case 'SET_QUOTE_FORM':
      return { ...state, showQuoteForm: action.payload };
    
    case 'SET_FLOATING_BAR':
      return { ...state, showFloatingBar: action.payload };
    
    case 'SET_LIGHTBOX':
      return { 
        ...state, 
        isLightboxOpen: action.payload.open,
        lightboxIndex: action.payload.index ?? state.lightboxIndex
      };
    
    default:
      return state;
  }
}

// Context
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience methods
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentProduct: (product: Product | null) => void;
  showQuoteForm: () => void;
  hideQuoteForm: () => void;
  toggleFloatingBar: (show: boolean) => void;
  openLightbox: (index?: number) => void;
  closeLightbox: () => void;
  
  // Initialization
  initializeApp: () => Promise<ServiceResult<void>>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useAppState = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Provider Component
interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Convenience methods
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setCurrentProduct = (product: Product | null) => {
    dispatch({ type: 'SET_CURRENT_PRODUCT', payload: product });
  };

  const showQuoteForm = () => {
    dispatch({ type: 'SET_QUOTE_FORM', payload: true });
  };

  const hideQuoteForm = () => {
    dispatch({ type: 'SET_QUOTE_FORM', payload: false });
  };

  const toggleFloatingBar = (show: boolean) => {
    dispatch({ type: 'SET_FLOATING_BAR', payload: show });
  };

  const openLightbox = (index: number = 0) => {
    dispatch({ type: 'SET_LIGHTBOX', payload: { open: true, index } });
  };

  const closeLightbox = () => {
    dispatch({ type: 'SET_LIGHTBOX', payload: { open: false } });
  };

  // App Initialization
  const initializeApp = async (): Promise<ServiceResult<void>> => {
    if (state.isInitialized) {
      return { success: true };
    }

    setLoading(true);
    setError(null);

    try {
      // Initialize all services in parallel
      const initResults = await Promise.allSettled([
        state.services.productLine.loadAvailableProductLines(),
        state.services.products.initialize(),
        state.services.rules.initialize(),
        state.services.skuBuilder.initialize(),
        state.services.uiConfiguration.initialize()
      ]);

      // Check for any failures
      const failures = initResults
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ result, index }) => {
          const serviceNames = ['productLine', 'products', 'rules', 'skuBuilder', 'uiConfiguration'];
          return `${serviceNames[index]}: ${(result as PromiseRejectedResult).reason}`;
        });

      if (failures.length > 0) {
        throw new Error(`Service initialization failed: ${failures.join(', ')}`);
      }

      // Get product lines from successful result
      const productLinesResult = initResults[0];
      if (productLinesResult.status === 'fulfilled') {
        const result = productLinesResult.value as ServiceResult<ProductLine[]>;
        if (result.success && result.data) {
          dispatch({ type: 'SET_PRODUCT_LINES', payload: result.data });
        }
      }

      dispatch({ type: 'SET_INITIALIZED', payload: true });
      setLoading(false);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize app';
      setError(errorMessage);
      setLoading(false);
      
      return { success: false, error: errorMessage };
    }
  };

  // Auto-initialize on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Service event listeners
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    // Listen to product line changes
    const unsubscribeProductLine = state.services.productLine.on('product-line-changed', (event) => {
      // Product line changed - could trigger other updates
      console.log('Product line changed:', event.data);
    });
    unsubscribers.push(unsubscribeProductLine);

    // Listen to configuration changes
    const unsubscribeConfig = state.services.configuration.on('configuration-changed', (event) => {
      // Configuration changed - update product if needed
      console.log('Configuration changed:', event.data);
    });
    unsubscribers.push(unsubscribeConfig);

    // Listen to product matches
    const unsubscribeProducts = state.services.products.on('product-matched', (event) => {
      const { product } = event.data;
      if (product) {
        setCurrentProduct(product);
      }
    });
    unsubscribers.push(unsubscribeProducts);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [state.services]);

  // Floating bar scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const shouldShow = scrollTop > 400;
      
      if (shouldShow !== state.showFloatingBar) {
        toggleFloatingBar(shouldShow);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [state.showFloatingBar]);

  // Lightbox keyboard controls
  useEffect(() => {
    if (!state.isLightboxOpen) return;

    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          dispatch({ 
            type: 'SET_LIGHTBOX', 
            payload: { open: true, index: state.lightboxIndex + 1 }
          });
          break;
        case 'ArrowLeft':
          dispatch({ 
            type: 'SET_LIGHTBOX', 
            payload: { open: true, index: Math.max(0, state.lightboxIndex - 1) }
          });
          break;
      }
    };

    // Disable body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = prevOverflow;
    };
  }, [state.isLightboxOpen, state.lightboxIndex]);

  const contextValue: AppContextValue = {
    state,
    dispatch,
    setLoading,
    setError,
    setCurrentProduct,
    showQuoteForm,
    hideQuoteForm,
    toggleFloatingBar,
    openLightbox,
    closeLightbox,
    initializeApp,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};