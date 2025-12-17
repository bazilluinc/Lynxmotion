import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
          L
        </div>
        <span className="font-bold text-xl tracking-tight text-white">
          Lynx<span className="text-indigo-400">Motion</span>
        </span>
      </div>
      <div className="ml-auto">
        <div className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-neutral-400 border border-white/10">
          Gemini 3 Powered
        </div>
      </div>
    </header>
  );
};