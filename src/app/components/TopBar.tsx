import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, BookMarked, FileText, Home } from 'lucide-react';
import { Button } from './ui/button';

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Buscar', href: '/search', icon: Search },
  { name: 'Mis Libros', href: '/my-books', icon: BookMarked },
  { name: 'Reseñas', href: '/reviews', icon: FileText },
];

export function TopBar() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  const isItemActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }

    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className={`sticky top-0 z-40 hidden border-b border-primary/30 bg-primary text-primary-foreground backdrop-blur ${isDashboard ? '' : 'md:block'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary-foreground transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight">LibRo</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={isActive ? '' : 'hover:bg-primary-foreground/10 hover:text-primary-foreground'}
                >
                  <Link to={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-3 z-50 px-3 md:hidden">
        <div className="mx-auto max-w-md rounded-2xl border border-primary-foreground/20 bg-primary/95 p-1.5 shadow-lg shadow-primary/30 backdrop-blur">
          <div className="grid h-16 grid-cols-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                aria-label={item.name}
                className="mx-0.5 flex items-center justify-center rounded-xl text-primary-foreground/80 transition-all duration-200"
              >
                <span
                  className={`flex min-w-[56px] flex-col items-center rounded-lg px-2 py-1.5 transition-all ${
                    isActive
                      ? 'bg-secondary/70 text-primary-foreground shadow-sm'
                      : 'hover:bg-primary-foreground/10 hover:text-primary-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="mt-0.5 text-[10px] font-medium leading-none">{item.name}</span>
                </span>
              </Link>
            );
          })}
          </div>
        </div>
      </nav>
    </>
  );
}