import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="stack">
      <h1>404</h1>
      <p>La ruta solicitada no existe.</p>
      <Link to="/">Ir al home</Link>
    </section>
  );
}
