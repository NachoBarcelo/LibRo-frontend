import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { FileText, Wrench } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function Reviews() {
  return (
    <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
      <PageHeader
        title="Mis Reseñas"
        subtitle="Módulo temporalmente desactivado"
        icon={<FileText className="mt-1 h-7 w-7 text-primary-foreground" />}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              En desarrollo
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Mis Reseñas está temporalmente desactivado. No me dio el tiempo para terminarlo :)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" disabled className="bg-secondary text-secondary-foreground">
              Próximamente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
