import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Library, BookMarked, FileText, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLibrary } from '../context/LibraryContext';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';

export function Dashboard() {
  const { userBooks, reviews, isLoading, error, reloadAll } = useLibrary();

  const stats = [
    {
      title: 'Total de Libros',
      value: userBooks.length,
      description: 'En tu colección',
      icon: Library,
      color: 'text-primary',
    },
    {
      title: 'Favoritos',
      value: userBooks.filter(b => b.status === 'FAVORITE').length,
      description: 'Marcados como favoritos',
      icon: BookMarked,
      color: 'text-red-600',
    },
    {
      title: 'Reseñas',
      value: reviews.length,
      description: 'Escritas por ti',
      icon: FileText,
      color: 'text-accent',
    },
    {
      title: 'Por Leer',
      value: userBooks.filter(b => b.status === 'TO_READ').length,
      description: 'En tu lista',
      icon: Search,
      color: 'text-blue-600',
    },
  ];

  const quickActions = [
    {
      title: 'Buscar Libros',
      description: 'Descubre y agrega nuevos libros a tu colección',
      icon: Search,
      href: '/search',
      color: 'from-primary/10 to-accent/10',
    },
    {
      title: 'Mis Libros',
      description: 'Gestiona tu colección personal',
      icon: BookMarked,
      href: '/my-books',
      color: 'from-primary/10 to-muted',
    },
    {
      title: 'Mis Reseñas',
      description: 'Lee y edita tus reseñas',
      icon: FileText,
      href: '/reviews',
      color: 'from-muted to-accent/10',
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Bienvenida a LibRo"
        subtitle="Tu biblioteca virtual personal"
        icon={<Sparkles className="mt-1 h-7 w-7 text-[#6f1028]" />}
      />


      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Quick Actions */}
        <div className='mb-8'>
          <h2 className="mb-4 text-xl">Accesos rápidos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.title}
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  <div className={`bg-gradient-to-br ${action.color} p-6`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg">{action.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {action.description}
                        </p>
                        <Button asChild className="mt-4" variant="secondary">
                          <Link to={action.href}>Ir ahora</Link>
                        </Button>
                      </div>
                      <Icon className="h-12 w-12 text-primary/20" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>


        {isLoading && <Loader text="Cargando resumen..." />}

        {!isLoading && error && (
          <ErrorMessage
            message={error}
            onRetry={() => {
              void reloadAll();
            }}
          />
        )}

        {!isLoading && !error && (
          <>
            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>


            {/* Recent Activity */}
            {reviews.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl">Reseñas recientes</h2>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/reviews">Ver todas</Link>
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.slice(0, 2).map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{review.title}</CardTitle>
                        <CardDescription>{review.bookTitle}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {review.content}
                        </p>
                        <div className="mt-3 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${i < review.rating ? 'text-amber-400' : 'text-muted'
                                }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}