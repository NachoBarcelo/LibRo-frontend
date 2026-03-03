import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface ReviewFormProps {
  initialData?: {
    bookId: string;
    bookTitle: string;
    title: string;
    content: string;
    rating: number;
  };
  onSubmit: (data: {
    bookId: string;
    bookTitle: string;
    title: string;
    content: string;
    rating: number;
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  variant?: 'default' | 'on-primary';
}

export function ReviewForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar reseña',
  isLoading = false,
  variant = 'default',
}: ReviewFormProps) {
  const isOnPrimary = variant === 'on-primary';

  const [formData, setFormData] = useState({
    bookId: initialData?.bookId || '',
    bookTitle: initialData?.bookTitle || '',
    title: initialData?.title || '',
    content: initialData?.content || '',
    rating: initialData?.rating || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hoveredRating, setHoveredRating] = useState(0);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bookTitle.trim()) {
      newErrors.bookTitle = 'El título del libro es requerido';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'El título de la reseña es requerido';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es requerido';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'El contenido debe tener al menos 10 caracteres';
    }

    if (formData.rating === 0) {
      newErrors.rating = 'Debes seleccionar una calificación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="bookTitle" className={isOnPrimary ? 'text-primary-foreground' : ''}>Título del libro</Label>
        <Input
          id="bookTitle"
          value={formData.bookTitle}
          onChange={(e) =>
            setFormData({ ...formData, bookTitle: e.target.value })
          }
          placeholder="Ej: El nombre del viento"
          disabled={isLoading}
          className={isOnPrimary ? 'border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60' : ''}
        />
        {errors.bookTitle && (
          <p className="text-sm text-destructive">{errors.bookTitle}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className={isOnPrimary ? 'text-primary-foreground' : ''}>Título de la reseña</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Una obra maestra"
          disabled={isLoading}
          className={isOnPrimary ? 'border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rating" className={isOnPrimary ? 'text-primary-foreground' : ''}>Calificación</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={isLoading}
              className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || formData.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : isOnPrimary
                    ? 'text-primary-foreground/55'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
          {formData.rating > 0 && (
            <span className={`ml-2 text-sm ${isOnPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {formData.rating} de 5
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="text-sm text-destructive">{errors.rating}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className={isOnPrimary ? 'text-primary-foreground' : ''}>Contenido de la reseña</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder="Comparte tu opinión sobre este libro..."
          rows={8}
          disabled={isLoading}
          className={isOnPrimary ? 'border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60' : ''}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className={isOnPrimary ? 'border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20' : ''}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className={isOnPrimary ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : ''}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
