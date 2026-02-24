import { Link, NavLink, Outlet } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/books/search', label: 'Buscar Libros' },
  { to: '/user-books', label: 'Mis Libros' },
  { to: '/reviews', label: 'Reseñas' }
];

export function MainLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          LibRo
        </Link>
        <nav className="nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
