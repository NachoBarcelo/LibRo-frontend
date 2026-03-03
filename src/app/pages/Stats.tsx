import React, { useMemo } from 'react';
import { BarChart3, BookCheck, BookMarked, BookOpen, LibraryBig, Users } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useLibrary } from '../context/LibraryContext';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function normalizeAuthorName(authorName?: string): string {
  return (authorName?.trim() || 'Autor desconocido').toLocaleLowerCase('es');
}

export function Stats() {
  const { userBooks, isLoading, error, reloadAll } = useLibrary();

  const stats = useMemo(() => {
    const totalSaved = userBooks.length;
    const totalWanted = userBooks.filter((book) => book.status === 'FAVORITE').length;
    const totalOwned = userBooks.filter((book) => book.status === 'TO_READ').length;
    const totalRead = userBooks.filter((book) => book.status === 'READ').length;

    const readProgress = totalSaved > 0 ? Math.round((totalRead / totalSaved) * 100) : 0;

    const favoriteAuthorCountMap = userBooks
      .filter((book) => book.status === 'FAVORITE')
      .reduce<Map<string, { displayName: string; count: number }>>((accumulator, book) => {
        const displayName = book.author?.trim() || 'Autor desconocido';
        const normalizedAuthor = normalizeAuthorName(displayName);
        const current = accumulator.get(normalizedAuthor);

        if (current) {
          current.count += 1;
          return accumulator;
        }

        accumulator.set(normalizedAuthor, { displayName, count: 1 });
        return accumulator;
      }, new Map());

    const topFavoriteAuthors = Array.from(favoriteAuthorCountMap.values())
      .sort((a, b) => b.count - a.count || a.displayName.localeCompare(b.displayName, 'es'))
      .slice(0, 5);

    return {
      totalSaved,
      totalWanted,
      totalOwned,
      totalRead,
      readProgress,
      topFavoriteAuthors
    };
  }, [userBooks]);

  return (
    <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />

      <PageHeader
        title="Estadísticas"
        subtitle="Resumen general de tu biblioteca personal"
        icon={<BarChart3 className="mt-1 h-7 w-7 text-primary-foreground" />}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        {isLoading && <Loader text="Calculando estadísticas..." />}

        {!isLoading && error && (
          <ErrorMessage
            message={error}
            onRetry={() => {
              void reloadAll();
            }}
          />
        )}

        {!isLoading && !error && stats.totalSaved === 0 ? (
          <EmptyState
            icon={<LibraryBig className="h-10 w-10 text-primary-foreground/70" />}
            title="Aún no hay datos"
            description="Agrega libros en Mis Libros para ver tus estadísticas generales."
          />
        ) : null}

        {!isLoading && !error && stats.totalSaved > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookMarked className="h-5 w-5" />
                    Guardados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{stats.totalSaved}</p>
                </CardContent>
              </Card>

              <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-5 w-5" />
                    Quiero
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{stats.totalWanted}</p>
                </CardContent>
              </Card>

              <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LibraryBig className="h-5 w-5" />
                    En propiedad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{stats.totalOwned}</p>
                </CardContent>
              </Card>

              <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookCheck className="h-5 w-5" />
                    Leídos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{stats.totalRead}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
              <CardHeader>
                <CardTitle>Progreso de lectura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between text-sm text-primary-foreground/85">
                  <span>Completado</span>
                  <span>{stats.readProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-primary-foreground/20">
                  <div className="h-full bg-secondary" style={{ width: `${stats.readProgress}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top 5 autores favoritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topFavoriteAuthors.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.topFavoriteAuthors.map((author, index) => (
                      <li
                        key={`${author.displayName}-${index}`}
                        className="flex items-center justify-between rounded-md border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-2"
                      >
                        <span className="text-sm text-primary-foreground">{author.displayName}</span>
                        <span className="text-xs text-primary-foreground/80">{author.count} libro(s)</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-primary-foreground/80">
                    Aún no hay libros en estado “Quiero” para calcular autores favoritos.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
