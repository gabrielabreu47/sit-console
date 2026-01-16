import React from 'react';
import { Bell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-transparent">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">SEAT / Console</p>
        <h1 className="text-lg font-semibold text-white">Notifications BackOffice</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
          <Bell className="h-5 w-5 text-white/70" />
        </div>
      </div>
    </header>
  );
};
