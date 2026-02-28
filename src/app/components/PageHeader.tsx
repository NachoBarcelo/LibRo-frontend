import React, { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, icon }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            {icon || <Sparkles className="mt-1 h-7 w-7 text-primary" />}
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl break-words">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm sm:text-base text-muted-foreground break-words">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
