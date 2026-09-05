import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans antialiased text-[#111827]">
      <TopNav />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
