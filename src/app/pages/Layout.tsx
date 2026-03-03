import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Toaster } from '../components/ui/sonner';

export function Layout() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const isPrimaryPage =
    isDashboard ||
    location.pathname === '/search' ||
    location.pathname === '/my-books' ||
    location.pathname === '/stats' ||
    location.pathname === '/reviews' ||
    location.pathname.startsWith('/reviews/') ||
    location.pathname.startsWith('/books/');

  return (
    <div className={`min-h-screen ${isPrimaryPage ? 'bg-primary' : 'bg-background'}`}>
      <TopBar />
      <main className={isPrimaryPage ? 'pb-0' : 'pb-24 md:pb-0'}>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
