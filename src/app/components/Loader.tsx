import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'on-primary';
}

export function Loader({ text = 'Cargando...', size = 'md', variant = 'default' }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const isOnPrimary = variant === 'on-primary';

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizeClasses[size]} animate-spin ${isOnPrimary ? 'text-primary-foreground' : 'text-primary'}`} />
      <p className={`text-sm ${isOnPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{text}</p>
    </div>
  );
}
