'use client';

/**
 * Main configurator page - Client Component
 *
 * This is a client component because it contains:
 * - Interactive state management (Zustand)
 * - Event handlers
 * - Browser APIs
 * - Real-time updates
 */

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the App component to avoid SSR issues
const App = dynamic(() => import('@/App'), {
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-6 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading Product Configurator
        </h2>
        <p className="text-gray-600">
          Preparing your custom mirror configuration experience...
        </p>
      </div>
    </div>
  ),
  ssr: false,
});

export default function Page() {
  return <App />;
}
