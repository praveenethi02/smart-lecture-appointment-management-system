import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-10 h-10 text-royal-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 p-4 text-slate-500">
      <Loader2 className="w-5 h-5 text-royal-600 animate-spin" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
