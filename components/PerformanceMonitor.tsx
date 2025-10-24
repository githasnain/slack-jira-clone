'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  apiResponseTime: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    apiResponseTime: 0
  });

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    try {
      // Monitor page load time
      const loadTime = performance.now();
      setMetrics(prev => ({ ...prev, loadTime }));

      // Monitor memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
        }));
      }

      // Monitor render time
      const observer = new PerformanceObserver((list) => {
        try {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'measure') {
              setMetrics(prev => ({ 
                ...prev, 
                renderTime: entry.duration 
              }));
            }
          });
        } catch (error) {
          console.warn('Performance monitoring error:', error);
        }
      });

      observer.observe({ entryTypes: ['measure'] });

      return () => {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn('Performance observer disconnect error:', error);
        }
      };
    } catch (error) {
      console.warn('Performance monitoring setup error:', error);
    }
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
      <div>Load: {metrics.loadTime.toFixed(2)}ms</div>
      <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
    </div>
  );
}
