import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'default' | 'on-primary';
}

export function ErrorMessage({
  title = 'Algo salió mal',
  message,
  onRetry,
  variant = 'default',
}: ErrorMessageProps) {
  const isOnPrimary = variant === 'on-primary';

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className={`rounded-full p-3 ${isOnPrimary ? 'bg-primary-foreground/12' : 'bg-destructive/10'}`}>
        <AlertCircle className={`h-8 w-8 ${isOnPrimary ? 'text-primary-foreground' : 'text-destructive'}`} />
      </div>
      <div className="space-y-1">
        <h3 className={`text-lg ${isOnPrimary ? 'text-primary-foreground' : ''}`}>{title}</h3>
        <p className={`max-w-md text-sm ${isOnPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{message}</p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className={`mt-2 ${isOnPrimary ? 'border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20' : ''}`}
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}
