import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
        </div>
        <EmptyState
          icon={<Search className="h-10 w-10 text-muted-foreground" />}
          title="Página no encontrada"
          description="Lo sentimos, la página que buscas no existe o ha sido movida."
          action={
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
