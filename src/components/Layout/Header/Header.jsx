import React, { useState } from 'react';
import Button from '../../UI/Button/Button';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/products', label: 'Productos' },
    { href: '/categories', label: 'Categorías' },
    { href: '/about', label: 'Nosotros' },
    { href: '/contact', label: 'Contacto' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <img src="/assets/logo.svg" alt="SinergiaB2B" />
          <span className={styles.logoText}>SinergiaB2B</span>
        </div>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <Button variant="outline" size="small">
            Iniciar Sesión
          </Button>
          <Button variant="primary" size="small">
            Registrarse
          </Button>
        </div>

        <button className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} className={styles.mobileNavLink}>
            {link.label}
          </a>
        ))}
        <div className={styles.mobileActions}>
          <Button variant="outline" size="medium" fullWidth>
            Iniciar Sesión
          </Button>
          <Button variant="primary" size="medium" fullWidth>
            Registrarse
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;