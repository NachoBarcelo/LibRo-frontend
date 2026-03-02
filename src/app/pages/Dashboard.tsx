import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BookMarked, FileText, BarChart3, Sparkles, Home } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '../components/ui/carousel';
import { getNewReleases, NewRelease } from '../../api/services/booksService';

function AutoFitTitle({ title }: { title: string }) {
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const [fontSizePx, setFontSizePx] = useState(24);

  useEffect(() => {
    const element = titleRef.current;
    if (!element) {
      return;
    }

    const fitText = () => {
      const viewportWidth = window.innerWidth;
      const maxSize = viewportWidth >= 1024 ? 30 : viewportWidth >= 640 ? 26 : 22;
      const minSize = viewportWidth >= 1024 ? 20 : 16;

      let nextSize = maxSize;
      element.style.fontSize = `${nextSize}px`;

      while (
        nextSize > minSize &&
        (element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1)
      ) {
        nextSize -= 1;
        element.style.fontSize = `${nextSize}px`;
      }

      setFontSizePx(nextSize);
    };

    const rafId = window.requestAnimationFrame(fitText);
    const resizeObserver = new ResizeObserver(() => {
      fitText();
    });

    resizeObserver.observe(element);
    window.addEventListener('resize', fitText);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', fitText);
    };
  }, [title]);

  return (
    <h3
      ref={titleRef}
      className="line-clamp-2 font-semibold leading-tight"
      style={{ fontSize: `${fontSizePx}px` }}
      title={title}
    >
      {title}
    </h3>
  );
}

export function Dashboard() {
  const location = useLocation();
  const { userBooks, isLoading, error, reloadAll } = useLibrary();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newReleasesCarouselApi, setNewReleasesCarouselApi] = useState<CarouselApi>();
  const [currentNewReleaseSlide, setCurrentNewReleaseSlide] = useState(0);
  const [newReleases, setNewReleases] = useState<NewRelease[]>([]);
  const [isLoadingNewReleases, setIsLoadingNewReleases] = useState(true);

  const featuredBooks = userBooks.slice(0, 8);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const updateCurrentSlide = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    updateCurrentSlide();
    carouselApi.on('select', updateCurrentSlide);
    carouselApi.on('reInit', updateCurrentSlide);

    return () => {
      carouselApi.off('select', updateCurrentSlide);
      carouselApi.off('reInit', updateCurrentSlide);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || featuredBooks.length <= 1) {
      return;
    }

    const autoplayInterval = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 4500);

    return () => {
      window.clearInterval(autoplayInterval);
    };
  }, [carouselApi, featuredBooks.length]);

  useEffect(() => {
    let isMounted = true;

    const loadNewReleases = async () => {
      try {
        const releases = await getNewReleases();
        if (isMounted) {
          setNewReleases(releases);
        }
      } finally {
        if (isMounted) {
          setIsLoadingNewReleases(false);
        }
      }
    };

    void loadNewReleases();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!newReleasesCarouselApi) {
      return;
    }

    const updateCurrentSlide = () => {
      setCurrentNewReleaseSlide(newReleasesCarouselApi.selectedScrollSnap());
    };

    updateCurrentSlide();
    newReleasesCarouselApi.on('select', updateCurrentSlide);
    newReleasesCarouselApi.on('reInit', updateCurrentSlide);

    return () => {
      newReleasesCarouselApi.off('select', updateCurrentSlide);
      newReleasesCarouselApi.off('reInit', updateCurrentSlide);
    };
  }, [newReleasesCarouselApi]);

  useEffect(() => {
    if (!newReleasesCarouselApi || newReleases.length <= 1) {
      return;
    }

    const autoplayInterval = window.setInterval(() => {
      newReleasesCarouselApi.scrollNext();
    }, 5500);

    return () => {
      window.clearInterval(autoplayInterval);
    };
  }, [newReleasesCarouselApi, newReleases.length]);

  const quickActions = [
    {
      title: 'Buscar Libros',
      icon: Search,
      href: '/search',
    },
    {
      title: 'Mi colección',
      icon: BookMarked,
      href: '/my-books',
    },
    {
      title: 'Mis Reseñas',
      icon: FileText,
      href: '/reviews',
    },
    {
      title: 'Estadísticas',
      icon: BarChart3,
      href: '#estadisticas',
    },
  ];

  const desktopNavigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Buscar', href: '/search', icon: Search },
    { name: 'Mis Libros', href: '/my-books', icon: BookMarked },
    { name: 'Reseñas', href: '/reviews', icon: FileText },
  ];

  const isItemActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }

    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />

      <div className="relative mx-auto w-full max-w-5xl px-5 py-5 sm:px-6 sm:py-6">
        <section className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-6 w-6" />
              <div>
                <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">Bienvenida a LibRo</h1>
                <p className="text-sm text-primary-foreground/85">Tu biblioteca virtual personal</p>
              </div>
            </div>

            <nav className="hidden items-center gap-1.5 md:flex">
              {desktopNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-foreground text-primary'
                        : 'text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </section>

        <section className="relative mt-6">
          <h2 className="mb-3 text-lg font-semibold sm:text-xl">Carrusel de tu colección</h2>

          {isLoading && <Loader text="Cargando libros..." />}

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
              {featuredBooks.length === 0 ? (
                <div className="rounded-2xl border border-primary-foreground/30 px-4 py-8 text-center text-sm">
                  Todavía no tienes libros en tu colección.
                </div>
              ) : (
                <>
                  <Carousel
                    setApi={setCarouselApi}
                    opts={{ align: 'start', loop: featuredBooks.length > 1 }}
                    className="w-full px-0.5"
                  >
                    <CarouselContent>
                      {featuredBooks.map((book) => (
                        <CarouselItem key={book.userBookId}>
                          <article className="flex min-h-72 gap-4 rounded-3xl border border-primary-foreground/30 bg-primary-foreground/10 p-4 shadow-sm md:min-h-80 md:gap-6 md:p-5">
                            <div className="flex w-44 shrink-0 items-center justify-center rounded-2xl md:w-52">
                              
                                {book.cover ? (
                                  <img src={book.cover} alt={book.title} className="rounded-2xl object-cover md:h-72 md:w-44" />
                                ) : (
                                  <div className="flex h-64 items-center justify-center rounded-2xl bg-primary-foreground/15 px-2 text-center text-xs text-primary-foreground/80 md:h-72 md:w-44">
                                    Sin portada
                                  </div>
                                )}
                              
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col justify-between">
                              <div>
                                <AutoFitTitle title={book.title} />
                                <p className="mt-2 line-clamp-2 text-sm text-primary-foreground/85 md:text-base">{book.author}</p>
                              </div>
                              <Link
                                to="/my-books"
                                className="inline-flex w-fit rounded-lg border border-primary-foreground/45 px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/12"
                              >
                                Ver en mi colección
                              </Link>
                            </div>
                          </article>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>

                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    {featuredBooks.map((book, index) => (
                      <button
                        key={book.userBookId}
                        type="button"
                        aria-label={`Ir al libro ${index + 1}`}
                        onClick={() => carouselApi?.scrollTo(index)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          currentSlide === index ? 'w-5 bg-primary-foreground' : 'bg-primary-foreground/45'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

        </section>

        <section className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                id={action.href === '#estadisticas' ? 'estadisticas' : undefined}
                className="rounded-2xl border border-primary-foreground/30 p-4 text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                <div className="flex h-24 flex-col items-start justify-between">
                  <Icon className="h-5 w-5 text-primary-foreground/90" />
                  <span className="text-base font-semibold leading-tight">{action.title}</span>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="relative mt-6">
          <h2 className="mb-3 text-xl font-semibold">Novedades</h2>

          {isLoadingNewReleases ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-2xl border border-primary-foreground/25 bg-primary-foreground/10" />
              ))}
            </div>
          ) : newReleases.length === 0 ? (
            <p className="rounded-2xl border border-primary-foreground/30 px-4 py-5 text-sm text-primary-foreground/85">
              No hay novedades por ahora.
            </p>
          ) : (
            <>
              <Carousel
                setApi={setNewReleasesCarouselApi}
                opts={{ align: 'start', loop: newReleases.length > 1 }}
                className="w-full"
              >
                <CarouselContent>
                  {newReleases.map((book) => (
                    <CarouselItem
                      key={`${book.workKey}-${book.titulo}`}
                      className="basis-1/2 lg:basis-1/3"
                    >
                      <article className="overflow-hidden rounded-2xl border border-primary-foreground/30 bg-primary-foreground/10">
                        <div className="flex aspect-[2/3] w-full items-center justify-center bg-primary-foreground/8 p-2">
                          <img
                            src={book.imagen}
                            alt={book.titulo}
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="space-y-1 p-3">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{book.titulo}</h3>
                          <p className="line-clamp-1 text-xs text-primary-foreground/80">{book.autor || 'Autor desconocido'}</p>
                          <p className="text-xs text-primary-foreground/70">{book.anio || 'Año s/d'}</p>
                        </div>
                      </article>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <div className="mt-3 flex items-center justify-center gap-1.5">
                {newReleases.map((book, index) => (
                  <button
                    key={`${book.workKey}-dot-${index}`}
                    type="button"
                    aria-label={`Ir a novedad ${index + 1}`}
                    onClick={() => newReleasesCarouselApi?.scrollTo(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      currentNewReleaseSlide === index ? 'w-5 bg-primary-foreground' : 'bg-primary-foreground/45'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}