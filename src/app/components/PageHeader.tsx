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
    <div className="border-b border-border bg-card/50 px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon || <Sparkles className="mt-1 h-7 w-7 text-primary" />}
            <div>
              <h1 className="text-3xl">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
