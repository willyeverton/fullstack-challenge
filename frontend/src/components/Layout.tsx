import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Sistema de Usuários</h1>
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/">Lista de Usuários</Link>
            </li>
            <li>
              <Link to="/users/new">Criar Usuário</Link>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className="app-content">
        <Outlet />
      </main>
      
      <footer className="app-footer">
        <p>Fullstack Challenge - Microsserviços</p>
      </footer>
    </div>
  );
};

export default Layout; 