import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BookMarked, FileText, Home, BarChart3 } from 'lucide-react';

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Buscar', href: '/search', icon: Search },
  { name: 'Mis Libros', href: '/my-books', icon: BookMarked },
  { name: 'Stats', href: '/stats', icon: BarChart3 },
  { name: 'Reseñas', href: '/reviews', icon: FileText },
];

export function TopBar() {
  const location = useLocation();

  const isItemActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }

    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="w-full border-t border-primary-foreground/20 bg-primary/95 px-3 py-1.5 backdrop-blur">
          <div className="grid h-16 grid-cols-5">
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