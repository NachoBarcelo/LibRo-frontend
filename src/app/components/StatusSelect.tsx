import React from 'react';
import { BookStatus } from '../types';
import { Heart, BookMarked, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface StatusSelectProps {
  value: BookStatus;
  onChange: (status: BookStatus) => void;
  disabled?: boolean;
}

const statusConfig = {
  FAVORITE: {
    label: 'Favorito',
    icon: Heart,
    color: 'text-red-600',
  },
  TO_READ: {
    label: 'Por leer',
    icon: BookMarked,
    color: 'text-blue-600',
  },
  READ: {
    label: 'Leído',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
};

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span>{config.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function StatusBadge({ status }: { status: BookStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm">
      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
      {config.label}
    </span>
  );
}
