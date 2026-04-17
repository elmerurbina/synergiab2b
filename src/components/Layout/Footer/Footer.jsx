import React from 'react';
import Button from '../../UI/Button/Button';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const footerSections = {
    company: {
      title: 'Empresa',
      links: [
        { label: 'Sobre Nosotros', href: '/about' },
        { label: 'Nuestro Equipo', href: '/team' },
        { label: 'Carreras', href: '/careers' },
        { label: 'Prensa', href: '/press' },
      ],
    },
    products: {
      title: 'Productos',
      links: [
        { label: 'Cómo Funciona', href: '/how-it-works' },
        { label: 'Precios', href: '/pricing' },
        { label: 'Proveedores', href: '/suppliers' },
        { label: 'Compradores', href: '/buyers' },
      ],
    },
    support: {
      title: 'Soporte',
      links: [
        { label: 'Centro de Ayuda', href: '/help' },
        { label: 'Términos y Condiciones', href: '/terms' },
        { label: 'Privacidad', href: '/privacy' },
        { label: 'Contacto', href: '/contact' },
      ],
    },
  };

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, href: '#' },
    { name: 'Twitter', icon: FaTwitter, href: '#' },
    { name: 'LinkedIn', icon: FaLinkedin, href: '#' },
    { name: 'Instagram', icon: FaInstagram, href: '#' },
  ];

  const contactInfo = [
    { icon: FaMapMarkerAlt, text: 'Juigalpa, Nicaragua' },
    { icon: FaEnvelope, text: 'info@sinergiab2b.com' },
    { icon: FaPhoneAlt, text: '+505 1234 5678' },
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
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.name} href={social.href} className={styles.socialLink} aria-label={social.name}>
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {Object.values(footerSections).map((section) => (
            <div key={section.title} className={styles.footerSection}>
              <h4>{section.title}</h4>
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
            <div className={styles.contactNewsletterSection}>
              <div>
                <h4>Contáctanos</h4>
                <div className={styles.contactInfo}>
                  {contactInfo.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className={styles.contactItem}>
                        <span className={styles.contactIcon}>
                          <Icon size={18} />
                        </span>
                        <span>{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.newsletterSection}>
                <h4>Newsletter</h4>
                <div className={styles.newsletterForm}>
                  <input
                    type="email"
                    placeholder="Tu correo electrónico"
                    className={styles.newsletterInput}
                  />
                  <Button variant="primary" size="medium" fullWidth>
                    Suscribirse
                  </Button>
                </div>
                <p className={styles.newsletterText}>
                  Recibe las mejores ofertas y novedades
                </p>
              </div>
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