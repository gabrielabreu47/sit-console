import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-workspace-base text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative h-full overflow-y-auto px-4 py-8 sm:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto space-y-10">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};
