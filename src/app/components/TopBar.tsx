import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, Library, BookMarked, FileText, Home } from 'lucide-react';
import { Button } from './ui/button';

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Buscar', href: '/search', icon: Search },
  { name: 'Mis Libros', href: '/my-books', icon: BookMarked },
  { name: 'Reseñas', href: '/reviews', icon: FileText },
];

export function TopBar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <BookOpen className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold tracking-tight">LibRo</span>
          </div>
          <div className="sm:hidden">
            <span className="text-xl font-bold tracking-tight">LibRo</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
              >
                <Link to={item.href} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
              >
                <Link to={item.href}>
                  <Icon className="h-4 w-4" />
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}