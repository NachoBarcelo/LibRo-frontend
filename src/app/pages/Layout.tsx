import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Toaster } from '../components/ui/sonner';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
