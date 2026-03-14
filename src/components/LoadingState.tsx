'use client';

import { useState, useEffect, useRef } from 'react';

interface LoadingStateProps {
  message?: string;
  startTime?: number | null;
}

export default function LoadingState({ message = 'Uncovering history...', startTime }: LoadingStateProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 100) / 10);
    };
    tick();
    intervalRef.current = setInterval(tick, 250); // 4 updates/sec — smooth enough for .toFixed(1) display

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime]);

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
      {/* Quill icon + message + timer */}
      <div className="flex items-center gap-3 mb-6">
        <svg
          className="w-6 h-6 text-amber-400 animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
        <span className="text-amber-400 font-medium animate-pulse">
          {message}
        </span>
        {startTime && (
          <span className="text-stone-500 text-sm font-mono ml-auto" data-testid="elapsed-timer">
            {elapsed.toFixed(1)}s
          </span>
        )}
      </div>

      {/* Skeleton lines */}
      <div className="space-y-3">
        <div className="h-4 bg-stone-800 rounded animate-pulse w-full" />
        <div className="h-4 bg-stone-800 rounded animate-pulse w-11/12" />
        <div className="h-4 bg-stone-800 rounded animate-pulse w-full" />
        <div className="h-4 bg-stone-800 rounded animate-pulse w-10/12" />
        <div className="h-4 bg-stone-800 rounded animate-pulse w-full" />
        <div className="h-4 bg-stone-800 rounded animate-pulse w-9/12" />
        <div className="h-4 bg-stone-800 rounded animate-pulse w-full" />
        <div className="h-4 bg-stone-800 rounded animate-pulse w-7/12" />
      </div>
    </div>
  );
}
