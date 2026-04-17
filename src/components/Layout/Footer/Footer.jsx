import React from 'react';
import Button from '../../UI/Button/Button';
import styles from './Footer.module.css';

const Footer = () => {
  const footerSections = {
    company: {
      links: [
        { label: 'Sobre Nosotros', href: '/about' },
        { label: 'Nuestro Equipo', href: '/team' },
        { label: 'Carreras', href: '/careers' },
        { label: 'Prensa', href: '/press' },
      ],
    },
    products: {
      links: [
        { label: 'Cómo Funciona', href: '/how-it-works' },
        { label: 'Precios', href: '/pricing' },
        { label: 'Proveedores', href: '/suppliers' },
        { label: 'Compradores', href: '/buyers' },
      ],
    },
    support: {
      links: [
        { label: 'Centro de Ayuda', href: '/help' },
        { label: 'Términos y Condiciones', href: '/terms' },
        { label: 'Privacidad', href: '/privacy' },
        { label: 'Contacto', href: '/contact' },
      ],
    },
  };

  const socialLinks = [
    { name: 'Facebook', icon: '📘', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'LinkedIn', icon: '🔗', href: '#' },
    { name: 'Instagram', icon: '📷', href: '#' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerGrid}>
          {/* Company Info */}
          <div className={styles.companySection}>
            <div className={styles.footerLogo}>
              <img src="/assets/logo.svg" alt="SinergiaB2B" />
              <span className={styles.footerLogoText}>SinergiaB2B</span>
            </div>
            <p className={styles.companyDescription}>
              Conectando negocios en Nicaragua. La plataforma líder para el descubrimiento de productos y servicios entre empresas.
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} className={styles.socialLink}>
                  <span>{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className={styles.footerSection}>
              <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
              <div className={styles.footerLinks}>
                {section.links.map((link) => (
                  <a key={link.label} href={link.href} className={styles.footerLink}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Contact & Newsletter */}
          <div className={styles.footerSection}>
            <h4>Contáctanos</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span>Juigalpa, Nicaragua</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📧</span>
                <span>info@sinergiab2b.com</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span>+505 1234 5678</span>
              </div>
            </div>

            <h4 style={{ marginTop: 'var(--spacing-lg)' }}>Newsletter</h4>
            <div className={styles.newsletterForm}>
              <input type="email" placeholder="Tu correo electrónico" className={styles.newsletterInput} />
              <Button variant="primary" size="small">Suscribirse</Button>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © 2026 SinergiaB2B. Todos los derechos reservados.
          </div>
          <div className={styles.legalLinks}>
            <a href="/privacy" className={styles.legalLink}>Política de Privacidad</a>
            <a href="/terms" className={styles.legalLink}>Términos de Uso</a>
            <a href="/cookies" className={styles.legalLink}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;