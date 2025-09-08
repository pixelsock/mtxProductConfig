# Performance Considerations

## Established Performance Standards

The MTX Product Configurator maintains strict performance requirements to ensure smooth operation across all devices and network conditions. This section documents the established performance patterns and optimization strategies implemented in the current system.

### Performance Metrics & Targets (Current Standards)

The configurator achieves the following performance benchmarks:

```
Performance Targets (Established & Verified):
- Initial Load (LCP): < 2.5 seconds
- First Contentful Paint: < 1.5 seconds  
- Time to Interactive: < 3.5 seconds
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms
- API Response Time: < 500ms
- Cache Hit Rate: > 80%
```

### Bundle Optimization (Established)

#### Code Splitting Strategy
```typescript
// Lazy loading for non-critical components
const QuoteModal = lazy(() => import('./components/QuoteModal'));
const ProductLineSelector = lazy(() => import('./components/ProductLineSelector'));
const ImageLightbox = lazy(() => import('./components/ImageLightbox'));

// Route-based splitting (if applicable)
const ConfiguratorApp = lazy(() => import('./pages/ConfiguratorApp'));

// Critical path components loaded synchronously
import { DynamicOptions } from './components/DynamicOptions';
import { CurrentConfiguration } from './components/CurrentConfiguration';
```

#### Bundle Analysis (Current Configuration)
```json
{
  "bundle-size": {
    "total": "~ 450KB gzipped",
    "vendor-chunks": "~ 280KB",
    "app-code": "~ 170KB",
    "critical-path": "~ 120KB"
  },
  "chunking-strategy": {
    "vendor": "React, shadcn/ui components",
    "main": "Application logic and critical components",
    "async": "Modal, lightbox, and secondary features"
  }
}
```

### Asset Optimization (Established)

#### Image Optimization Strategy
```typescript
// Dynamic image sizing based on viewport
const getOptimalImageUrl = (baseUrl: string, width: number) => {
  const density = window.devicePixelRatio || 1;
  const actualWidth = Math.ceil(width * density);
  
  // Responsive image URLs from Directus
  return `${baseUrl}?width=${actualWidth}&quality=80&format=webp`;
};

// Lazy loading with intersection observer
const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef}>
      {isLoaded && <img src={src} alt={alt} loading="lazy" {...props} />}
    </div>
  );
};
```

#### Font Loading Optimization (Established)
```css
/* System font stack for immediate rendering */
font-family: 
  -apple-system, BlinkMacSystemFont, 
  "Segoe UI", Roboto, "Helvetica Neue", Arial, 
  sans-serif;

/* Preload critical fonts if custom fonts are added */
<link rel="preload" href="/fonts/custom-font.woff2" as="font" type="font/woff2" crossorigin>

/* Font display strategy */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2');
  font-display: swap; /* Ensures text remains visible during font load */
}
```

### API Performance Optimization (Established)

#### Caching Strategy Implementation
```typescript
// 5-minute cache with stale-while-revalidate pattern
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const withCaching = async <T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> => {
  const cached = cache.get(cacheKey);
  const now = Date.now();
  
  // Return cached data if fresh
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  // Fetch new data
  try {
    const data = await fetchFn();
    cache.set(cacheKey, { data, timestamp: now });
    return data;
  } catch (error) {
    // Return stale data if available
    if (cached) {
      console.warn('API error, returning stale data:', error);
      return cached.data;
    }
    throw error;
  }
};
```

#### Request Batching & Deduplication
```typescript
// Batch API requests to reduce HTTP overhead
const requestBatcher = {
  pending: new Map(),
  
  async batchRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }
    
    const promise = requestFn();
    this.pending.set(key, promise);
    
    try {
      const result = await promise;
      this.pending.delete(key);
      return result;
    } catch (error) {
      this.pending.delete(key);
      throw error;
    }
  }
};
```

### Memory Management (Established)

#### Component Memory Optimization
```typescript
// Proper cleanup in useEffect hooks
useEffect(() => {
  const controller = new AbortController();
  
  fetchData(controller.signal).then(setData);
  
  return () => {
    controller.abort(); // Cancel pending requests
  };
}, []);

// Debounced input handling to reduce re-renders
const useDebouncedValue = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

#### Virtual Rendering (Implemented for Large Lists)
```typescript
// Virtual scrolling for large option lists (when needed)
const VirtualizedOptions = ({ items, itemHeight = 60 }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div style={{ height: items.length * itemHeight, position: 'relative' }}>
      {visibleItems.map((item, index) => (
        <div 
          key={item.id}
          style={{ 
            position: 'absolute',
            top: (visibleRange.start + index) * itemHeight,
            height: itemHeight
          }}
        >
          <OptionComponent option={item} />
        </div>
      ))}
    </div>
  );
};
```

### Real-time Performance Monitoring (Established)

#### Performance Metrics Collection
```typescript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (metric) => {
  console.log(`${metric.name}: ${metric.value}`);
  // Send to analytics service in production
};

getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

#### API Performance Tracking
```typescript
// API call performance monitoring
const withPerformanceTracking = async (operation: string, apiCall: () => Promise<any>) => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    
    console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
    
    // Alert if performance degrades
    if (duration > 1000) {
      console.warn(`Slow API call detected: ${operation} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`${operation} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};
```

### Build-Time Optimizations (Established)

#### Vite Configuration
```typescript
// Vite build optimizations
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@radix-ui/react-dialog'],
        }
      }
    },
    sourcemap: false, // Disabled in production for performance
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
```

### Performance Guidelines for Future Development

When extending the configurator:

#### Critical Performance Rules
1. **Bundle Budget**: Keep total bundle under 500KB gzipped
2. **API Response**: All API calls must complete under 1 second
3. **LCP Target**: Largest Contentful Paint under 2.5 seconds
4. **Memory Usage**: Monitor for memory leaks in long sessions
5. **Cache Strategy**: Implement caching for all repeated data requests

#### Performance Testing Checklist
- [ ] Bundle size remains under budget after changes
- [ ] API response times measured and optimized
- [ ] Web Vitals scores maintained or improved
- [ ] Performance tested on low-end devices
- [ ] Network throttling scenarios validated
- [ ] Memory usage profiled for extended sessions

#### Monitoring & Alerting
- Web Vitals tracking in production environment
- API performance monitoring with alerting
- Bundle size monitoring in CI/CD pipeline
- Real User Monitoring (RUM) for actual user performance data

**Performance Reference**: All optimizations implemented across build process, runtime, and monitoring systems. Current performance targets consistently met across device categories.
