import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Toaster } from '../components/ui/sonner';

export function Layout() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className={`min-h-screen ${isDashboard ? 'bg-primary' : 'bg-background'}`}>
      <TopBar />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
