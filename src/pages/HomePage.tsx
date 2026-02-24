import { Link } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';

export function HomePage() {
  return (
    <section className="stack">
      <PageHeader
        title="Dashboard"
        subtitle="Accesos rápidos a búsqueda, user-books y reseñas."
      />

      <div className="grid">
        <Link to="/books/search" className="card-link">
          Buscar libros
        </Link>
        <Link to="/user-books" className="card-link">
          Mis libros
        </Link>
        <Link to="/reviews" className="card-link">
          Reseñas
        </Link>
      </div>
    </section>
  );
}
