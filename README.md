# ⚡ Fast Flags

High-performance feature flag system with optimized bundle size, lightning-fast load times, and comprehensive performance monitoring.

## 🚀 Performance Features

- **Sub-1s load times** with optimized bundle splitting
- **< 1ms flag evaluations** with multi-layer caching
- **50KB gzipped bundle** with aggressive optimization
- **90%+ cache hit rates** for instant responses
- **Real-time performance monitoring** and metrics

## 🛠 Tech Stack

- **React 18** with concurrent features
- **TypeScript** for type safety
- **Vite** for ultra-fast development and optimized builds
- **Zustand** for lightweight state management (2KB vs Redux 15KB)
- **IndexedDB** for persistent client-side caching
- **Service Workers** for offline capabilities

## 📊 Performance Optimizations

### Bundle Optimization
- Manual code splitting with vendor/store/utils chunks
- Tree shaking and dead code elimination
- Terser minification with console.log removal
- Bundle size monitoring with automated checks

### Runtime Performance
- Multi-layer caching (Memory + IndexedDB)
- Request batching and deduplication
- Memoized flag evaluations with TTL
- React.memo and selective subscriptions

### Load Time Optimization
- Lazy loading for all major components
- Critical CSS inlining
- Font preloading
- Progressive Web App capabilities

## 🏃‍♂️ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Run performance audit
npm run lighthouse
```

## 📈 Performance Monitoring

Access the built-in performance dashboard at `/metrics` to monitor:

- Flag evaluation times (avg, P95, P99)
- Cache hit rates and memory usage
- Bundle size analysis
- Real-time system metrics

## 🧪 Testing

Visit `/testing` to:

- Test flag behavior with different user segments
- Run automated test scenarios
- Debug flag evaluations in real-time
- Simulate A/B testing scenarios

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run analyze` - Analyze bundle composition
- `npm run lighthouse` - Run Lighthouse performance audit
- `npm run size-check` - Check bundle size limits
- `npm test` - Run test suite
- `npm run test:coverage` - Run tests with coverage

## 🏗 Architecture

```
src/
├── components/          # React components with lazy loading
├── hooks/              # Optimized custom hooks
├── stores/             # Zustand state management
├── utils/              # Performance utilities and caching
├── api/                # Mock API server for development
├── styles/             # Optimized CSS with variables
└── types/              # TypeScript definitions
```

## 🎯 Performance Targets

- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.5s  
- **Time to Interactive**: < 3.8s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 📚 Documentation

See [PERFORMANCE_ANALYSIS.md](./PERFORMANCE_ANALYSIS.md) for detailed performance analysis and optimization strategies.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run performance tests: `npm run lighthouse`
4. Ensure bundle size limits: `npm run size-check`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
