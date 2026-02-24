import React, { ReactNode, useState } from 'react';
import { Book } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { BookOpen, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';

interface BookCardProps {
  book: Book;
  actions?: ReactNode;
  badge?: ReactNode;
  onClick?: () => void;
  variant?: 'grid' | 'list';
  menuTriggerIcon?: ReactNode;
  menuTriggerLabel?: string;
  menuTriggerClassName?: string;
}

export function BookCard({
  book,
  actions,
  badge,
  onClick,
  variant = 'grid',
  menuTriggerIcon,
  menuTriggerLabel,
  menuTriggerClassName
}: BookCardProps) {
  const isList = variant === 'list';
  const showMenu = isList && Boolean(actions);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerIcon = menuTriggerIcon ?? <MoreHorizontal className="h-4 w-4" />;
  const triggerLabel = menuTriggerLabel ?? 'Abrir acciones';
  const triggerClassName = `h-8 w-8 ${menuTriggerClassName ?? ''}`;

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={isList ? 'flex h-28 sm:h-32' : ''}>
        <div
          className={isList
            ? 'relative h-28 w-20 flex-shrink-0 overflow-hidden bg-muted sm:h-32 sm:w-24'
            : 'relative aspect-[2/3] overflow-hidden bg-muted'
          }
        >
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <BookOpen
                className={isList ? 'h-8 w-8 text-muted-foreground/30' : 'h-16 w-16 text-muted-foreground/30'}
              />
            </div>
          )}
          {badge && !isList && (
            <div className="absolute right-2 top-2">
              {badge}
            </div>
          )}
        </div>
        <div className={isList ? 'flex min-w-0 flex-1 flex-col overflow-hidden' : ''}>
          <CardContent className={isList ? 'flex-1 overflow-hidden p-4 py-3' : 'p-4'}>
            <div className={isList ? 'flex items-start justify-between gap-3' : ''}>
              <h3 className="line-clamp-2 text-base">{book.title}</h3>
              {showMenu && (
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={triggerClassName}
                      onClick={(event) => event.stopPropagation()}
                      onPointerDown={(event) => event.stopPropagation()}
                      aria-label={triggerLabel}
                    >
                      {triggerIcon}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2">
                    <div className="flex flex-col gap-2">
                      {actions}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
            {book.year && (
              <p className="mt-0.5 text-xs text-muted-foreground">{book.year}</p>
            )}
            {book.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {book.description}
              </p>
            )}
          </CardContent>
          {actions && !isList && (
            <CardFooter className={isList ? 'mt-auto border-t border-border px-4 pb-3 pt-2' : 'border-t border-border p-3'}>
              {actions}
            </CardFooter>
          )}
        </div>
      </div>
    </Card>
  );
}
