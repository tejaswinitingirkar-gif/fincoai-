'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function DebugLogger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    console.log(`%c[ROUTE] Navigated to: ${url}`, "color: #4F46E5; font-weight: bold; background: #0F172A; padding: 2px 5px; border-radius: 4px;");
  }, [pathname, searchParams]);

  useEffect(() => {
    // Basic interceptor-like logging for fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const endpoint = args[0];
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        if (response.ok) {
          console.log(`%c[API SUCCESS] ${endpoint} (${duration}ms)`, "color: #22C55E; font-weight: bold;");
        } else {
          console.error(`%c[API ERROR] ${endpoint} (${response.status})`, "color: #EF4444; font-weight: bold;");
        }
        
        return response;
      } catch (error) {
        console.error(`%c[API CRITICAL] ${endpoint} failed: ${error.message}`, "color: #FFFFFF; background: #EF4444; font-weight: bold; padding: 2px 5px;");
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
