import React, { useEffect, useState } from 'react';
import { WifiOff, Sparkles } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-emerald-600/95 backdrop-blur-xs px-4 py-1.5 text-xs font-bold text-white shadow-lg border border-emerald-400"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>Playing 100% Offline — All Animals & Sounds Ready!</span>
      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
    </div>
  );
};
