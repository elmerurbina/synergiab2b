import React, { useState } from 'react';
import Button from '../../UI/Button/Button';
import Modal from '../../UI/Modal/Modal';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import styles from './Footer.module.css';

const modalContents = {
  'Sobre Nosotros': {
    title: 'Sobre Nosotros',
    content: (
      <div>
        <p><strong>SinergiaB2B</strong> es la plataforma B2B líder en Nicaragua, creada con la visión de revolucionar la forma en que las empresas locales y regionales se conectan, interactúan y cierran negocios.</p>
        <p>Nuestra misión es empoderar a pequeños, medianos y grandes proveedores a digitalizar sus catálogos y acceder a oportunidades reales de comercialización. Al mismo tiempo, brindamos a los departamentos de compras herramientas de búsqueda inteligente y análisis comparativo para hacer su abastecimiento más rápido, económico y transparente.</p>
      </div>
    )
  },
  'Nuestro Equipo': {
    title: 'Nuestro Equipo',
    content: (
      <div>
        <p>En SinergiaB2B contamos con un equipo apasionado de ingenieros de software, diseñadores de producto y especialistas en comercio electrónico y operaciones B2B.</p>
        <p>Nuestro equipo directivo está formado por profesionales con amplia experiencia en la industria tecnológica de Nicaragua, dedicados a construir relaciones comerciales fuertes, seguras e innovadoras en el país.</p>
      </div>
    )
  },
  'Carreras': {
    title: 'Carreras y Oportunidades',
    content: (
      <div>
        <p>¿Quieres ser parte de la transformación digital de Nicaragua? En SinergiaB2B buscamos constantemente talento excepcional en las áreas de desarrollo, ventas y servicio al cliente.</p>
        <p>Escríbenos a <strong>carreras@sinergiab2b.com</strong> enviando tu CV y portafolio. ¡Nos encantaría conocerte!</p>
      </div>
    )
  },
  'Prensa': {
    title: 'Prensa y Medios de Comunicación',
    content: (
      <div>
        <p>Bienvenido a nuestro centro de prensa. Aquí encontrarás notas oficiales sobre nuestros lanzamientos, crecimiento, alianzas corporativas e impacto económico en las PyMEs nicaragüenses.</p>
        <p>Para solicitudes de entrevistas o material de prensa, contáctanos en <strong>prensa@sinergiab2b.com</strong>.</p>
      </div>
    )
  },
  'Cómo Funciona': {
    title: '¿Cómo Funciona SinergiaB2B?',
    content: (
      <div>
        <ol style={{ paddingLeft: '20px' }}>
          <li><strong>Regístrate:</strong> Crea tu cuenta de Comprador o Proveedor en pocos minutos.</li>
          <li><strong>Explora o Publica:</strong> Si eres comprador, busca en el catálogo con filtros avanzados. Si eres proveedor, sube tus productos y servicios con detalles técnicos y precios.</li>
          <li><strong>Guarda y Valora:</strong> Guarda productos favoritos y valora proveedores basados en tu experiencia real.</li>
          <li><strong>Contacto Directo:</strong> Envía consultas directas a través de WhatsApp con mensajes pre-llenados y cierra negociaciones directas.</li>
        </ol>
      </div>
    )
  },
  'Precios': {
    title: 'Planes y Precios',
    content: (
      <div>
        <p>Ofrecemos planes diseñados para el tamaño de tu negocio:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Plan Gratuito:</strong> Cero costo mensual, perfecto para pequeños negocios (hasta 10 productos en catálogo).</li>
          <li><strong>Plan Profesional ($49/mes):</strong> Hasta 100 productos, posicionamiento prioritario en búsquedas y soporte dedicado.</li>
          <li><strong>Plan Empresarial ($99/mes):</strong> Productos ilimitados, analítica avanzada de visitas e interacciones, y campañas promocionales internas.</li>
        </ul>
      </div>
    )
  },
  'Proveedores': {
    title: 'Sección de Proveedores',
    content: (
      <div>
        <p>Incrementa la visibilidad de tu negocio corporativo y accede a clientes pre-calificados en Nicaragua.</p>
        <p><strong>Beneficios clave:</strong></p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Presencia web profesional sin necesidad de mantener un servidor propio.</li>
          <li>Métricas detalladas sobre qué productos atraen más clics y visitas.</li>
          <li>Contacto directo por WhatsApp con compradores interesados.</li>
        </ul>
      </div>
    )
  },
  'Compradores': {
    title: 'Sección de Compradores',
    content: (
      <div>
        <p>Optimizá tu proceso de cotización y abastecimiento corporativo con herramientas diseñadas para compradores exigentes.</p>
        <p><strong>Ventajas principales:</strong></p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Búsqueda jerárquica y filtros por departamento de Nicaragua.</li>
          <li>Favoritos y valoraciones para llevar un registro de los mejores proveedores.</li>
          <li>Plataforma rápida, moderna y 100% gratuita para compradores.</li>
        </ul>
      </div>
    )
  },
  'Centro de Ayuda': {
    title: 'Centro de Ayuda',
    content: (
      <div>
        <p>¿Tienes dudas sobre cómo registrarte, publicar productos o recuperar tu cuenta?</p>
        <p>Visita nuestras guías de ayuda o contáctanos directamente a nuestro chat de atención al cliente. Estamos aquí para guiarte en cada paso de tu digitalización comercial.</p>
      </div>
    )
  },
  'Términos y Condiciones': {
    title: 'Términos y Condiciones de Uso',
    content: (
      <div>
        <p>Bienvenido a SinergiaB2B. Al acceder a nuestra plataforma, aceptas cumplir con nuestros términos de servicio, políticas de buen uso del catálogo, y normas de conducta comercial ética.</p>
        <p>Queda prohibida la publicación de productos ilegales, estafas o información de contacto falsa. SinergiaB2B se reserva el derecho de suspender cuentas que infrinjan estas directrices.</p>
      </div>
    )
  },
  'Privacidad': {
    title: 'Política de Privacidad',
    content: (
      <div>
        <p>En SinergiaB2B nos tomamos muy en serio la seguridad y el tratamiento de tus datos personales e información comercial corporativa.</p>
        <p>Tus datos no serán vendidos ni compartidos con terceros con fines comerciales sin tu consentimiento explícito. Almacenamos tu información bajo altos estándares de cifrado y seguridad.</p>
      </div>
    )
  },
  'Contacto': {
    title: 'Contacto Directo',
    content: (
      <div>
        <p>Estamos ubicados en Juigalpa, Chontales, Nicaragua.</p>
        <p><strong>Correo de soporte:</strong> soporte@sinergiab2b.com</p>
        <p><strong>Línea telefónica:</strong> +505 1234 5678</p>
        <p>Puedes contactarnos de Lunes a Viernes de 8:00 AM a 5:00 PM.</p>
      </div>
    )
  },
  'Política de Privacidad': {
    title: 'Política de Privacidad Integral',
    content: (
      <div>
        <p>Esta política detalla cómo recopilamos, usamos y protegemos la información personal y comercial de los compradores y proveedores registrados en SinergiaB2B.</p>
        <p>Cumplimos con las regulaciones de protección de datos de Nicaragua y aplicamos las mejores prácticas internacionales en seguridad cibernética.</p>
      </div>
    )
  },
  'Términos de Uso': {
    title: 'Términos de Uso de la Plataforma',
    content: (
      <div>
        <p>El uso del sitio web SinergiaB2B está condicionado a la aceptación de estas normas. La plataforma provee intermediación de contacto informativo, y no interviene ni se responsabiliza de los acuerdos finales de compraventa entre las partes.</p>
      </div>
    )
  },
  'Cookies': {
    title: 'Política de Cookies',
    content: (
      <div>
        <p>SinergiaB2B utiliza cookies técnicas de sesión y analíticas para recordar tus preferencias de búsqueda, mantener tu sesión iniciada de manera segura y analizar el tráfico para mejorar continuamente la experiencia de usuario.</p>
      </div>
    )
  }
};

const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState(null);

  const handleLinkClick = (e, label) => {
    e.preventDefault();
    const data = modalContents[label];
    if (data) {
      setModalTitle(data.title);
      setModalContent(data.content);
      setModalOpen(true);
    }
  };

  const footerSections = {
    company: {
      title: 'Empresa',
      links: [
        { label: 'Sobre Nosotros' },
        { label: 'Nuestro Equipo' },
        { label: 'Carreras' },
        { label: 'Prensa' },
      ],
    },
    products: {
      title: 'Productos',
      links: [
        { label: 'Cómo Funciona' },
        { label: 'Precios' },
        { label: 'Proveedores' },
        { label: 'Compradores' },
      ],
    },
    support: {
      title: 'Soporte',
      links: [
        { label: 'Centro de Ayuda' },
        { label: 'Términos y Condiciones' },
        { label: 'Privacidad' },
        { label: 'Contacto' },
      ],
    },
  };

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, href: 'https://www.facebook.com/' },
    { name: 'Twitter', icon: FaTwitter, href: 'https://x.com/' },
    { name: 'LinkedIn', icon: FaLinkedin, href: 'linkedin.com' },
    { name: 'Instagram', icon: FaInstagram, href: 'https://www.instagram.com/' },
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
                  <a
                    key={link.label}
                    href="#"
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className={styles.footerLink}
                  >
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
            <a href="#" onClick={(e) => handleLinkClick(e, 'Política de Privacidad')} className={styles.legalLink}>Política de Privacidad</a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'Términos de Uso')} className={styles.legalLink}>Términos de Uso</a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'Cookies')} className={styles.legalLink}>Cookies</a>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
        {modalContent}
      </Modal>
    </footer>
  );
};

export default Footer;