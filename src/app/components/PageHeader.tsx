import React, { ReactNode } from 'react';
import { Home, Search, BookMarked, FileText, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, icon }: PageHeaderProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Buscar', href: '/search', icon: Search },
    { name: 'Mis Libros', href: '/my-books', icon: BookMarked },
    { name: 'Reseñas', href: '/reviews', icon: FileText },
  ];

  const isItemActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }

    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-5 sm:px-6 sm:py-6">
      <section className="relative">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {icon || <Sparkles className="mt-0.5 h-6 w-6 text-primary-foreground" />}
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
              {subtitle && (
                <p className="mt-1 break-words text-sm text-primary-foreground/85">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
            <nav className="hidden items-center gap-1.5 md:flex">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-foreground text-primary'
                        : 'text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {actions ? <div className="flex w-full items-center gap-2 md:w-auto md:justify-end">{actions}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
