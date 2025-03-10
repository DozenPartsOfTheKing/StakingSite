import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Staking Platform
        </Link>

        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink to="/" className="nav-link">
              Главная
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/tokens" className="nav-link">
              Токены
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <NavLink to="/staking" className="nav-link">
                  Стейкинг
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/profile" className="nav-link">
                  Профиль
                </NavLink>
              </li>
              <li className="nav-item">
                <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <NavLink to="/login" className="nav-link">
                Войти
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 