// components/Header/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../UI/Button/Button';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  console.log('Header - Render:', { isAuthenticated, user });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    console.log('Header - Handling logout');
    await logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/login');
    setIsMenuOpen(false);
  };

  const getNavLinks = () => {
    const baseLinks = [
      { href: '/', label: 'Inicio' },
      { href: '/products', label: 'Productos' },
      { href: '/categories', label: 'Categorías' },
    ];
    
    if (user?.rol === 'proveedor') {
      baseLinks.push({ href: '/manage-catalog', label: 'Manejar Catálogos' });
      baseLinks.push({ href: '/about', label: 'Nosotros' });
    } else if (user?.rol === 'admin') {
      baseLinks.push({ href: '/admin/products', label: 'Administrar Productos' });
      baseLinks.push({ href: '/admin/users', label: 'Usuarios' });
      baseLinks.push({ href: '/about', label: 'Nosotros' });
    } else {
      baseLinks.push({ href: '/about', label: 'Nosotros' });
      baseLinks.push({ href: '/contact', label: 'Contacto' });
    }
    
    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/assets/logo.svg" alt="SinergiaB2B" />
          </Link>
          <Link to="/" className={styles.logoText}>
            SinergiaB2B
          </Link>
        </div>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {!isAuthenticated ? (
            <>
              <Button 
                variant="outline" 
                size="small"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
              <Button 
                variant="primary" 
                size="small"
                onClick={() => navigate('/register')}
              >
                Registrarse
              </Button>
            </>
          ) : (
            <>
              <span className={styles.userName}>
                {user?.empresa || user?.username || user?.email}
              </span>
              {user?.rol === 'proveedor' && (
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => navigate('/dashboard/proveedor')}
                >
                  Dashboard
                </Button>
              )}
              {user?.rol === 'admin' && (
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => navigate('/dashboard/admin')}
                >
                  Admin
                </Button>
              )}
              <Button 
                variant="danger" 
                size="small"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </>
          )}
        </div>

        <button className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.href} 
            to={link.href} 
            className={styles.mobileNavLink}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className={styles.mobileActions}>
          {!isAuthenticated ? (
            <>
              <Button 
                variant="outline" 
                size="medium" 
                fullWidth
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
              >
                Iniciar Sesión
              </Button>
              <Button 
                variant="primary" 
                size="medium" 
                fullWidth
                onClick={() => {
                  navigate('/register');
                  setIsMenuOpen(false);
                }}
              >
                Registrarse
              </Button>
            </>
          ) : (
            <>
              <div className={styles.mobileUserInfo}>
                <span>👤 {user?.empresa || user?.username || user?.email}</span>
              </div>
              {user?.rol === 'proveedor' && (
                <Button 
                  variant="outline" 
                  size="medium" 
                  fullWidth
                  onClick={() => {
                    navigate('/dashboard/proveedor');
                    setIsMenuOpen(false);
                  }}
                >
                  Dashboard
                </Button>
              )}
              {user?.rol === 'admin' && (
                <Button 
                  variant="outline" 
                  size="medium" 
                  fullWidth
                  onClick={() => {
                    navigate('/dashboard/admin');
                    setIsMenuOpen(false);
                  }}
                >
                  Admin
                </Button>
              )}
              <Button 
                variant="danger" 
                size="medium" 
                fullWidth
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Cerrar Sesión
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;