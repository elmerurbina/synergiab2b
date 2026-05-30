import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaInstagram, FaLinkedin, FaChevronDown, FaChevronUp, FaWhatsapp, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [openFaqs, setOpenFaqs] = useState([]);

  const faqs = [
    {
      id: 1,
      question: '¿Cómo puedo registrarme como proveedor en SinergiaB2B?',
      answer: 'Para registrarte como proveedor, haz clic en "Registrarse" en la página principal, selecciona el rol "Proveedor" y completa el formulario con la información de tu empresa. Una vez registrado, podrás comenzar a publicar tus productos inmediatamente.'
    },
    {
      id: 2,
      question: '¿Cuánto cuesta usar la plataforma?',
      answer: 'SinergiaB2B es completamente gratuita para compradores. Para proveedores, ofrecemos planes gratuitos básicos y planes premium con funcionalidades adicionales como productos patrocinados y estadísticas avanzadas.'
    },
    {
      id: 3,
      question: '¿Cómo puedo contactar a un proveedor?',
      answer: 'Cada producto tiene un botón de WhatsApp que te permite contactar directamente al proveedor. También puedes ver la información de contacto en el perfil del proveedor.'
    },
    {
      id: 4,
      question: '¿Qué tipos de productos puedo encontrar en la plataforma?',
      answer: 'En SinergiaB2B encontrarás productos de diversas categorías: materiales de construcción, productos agropecuarios, suministros de oficina, alimentos y bebidas, productos industriales, servicios profesionales y mucho más.'
    },
    {
      id: 5,
      question: '¿Cómo funciona el sistema de valoraciones?',
      answer: 'Los compradores pueden calificar y comentar sobre los productos que han adquirido. Las valoraciones ayudan a mantener la calidad y transparencia en la plataforma, permitiendo a otros compradores tomar decisiones informadas.'
    },
    {
      id: 6,
      question: '¿Es seguro comprar a través de SinergiaB2B?',
      answer: 'SinergiaB2B verifica a todos los proveedores registrados y monitorea las transacciones para garantizar un entorno seguro. Recomendamos siempre solicitar factura y mantener comunicación a través de nuestros canales oficiales.'
    },
    {
      id: 7,
      question: '¿Puedo editar o eliminar mis productos publicados?',
      answer: 'Sí, como proveedor puedes acceder a tu panel de control donde encontrarás todas las opciones para gestionar tu catálogo: editar, activar/desactivar o eliminar productos.'
    },
    {
      id: 8,
      question: '¿Cómo puedo promocionar mis productos?',
      answer: 'Ofrecemos planes de productos patrocinados que aparecen destacados en la página principal y en las búsquedas. Contacta con nuestro equipo para más información sobre precios y beneficios.'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleFaq = (id) => {
    setOpenFaqs(prev => 
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call - Replace with actual email service
    setTimeout(() => {
      console.log('Contact form submitted:', formData);
      toast.success('Mensaje enviado exitosamente. Te responderemos pronto.');
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Contáctanos</h1>
          <p className={styles.heroSubtitle}>
            Estamos aquí para ayudarte y responder tus preguntas
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Contact Info Cards */}
        <div className={styles.contactInfoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FaMapMarkerAlt />
            </div>
            <h3>Dirección</h3>
            <p>Frente al Parque Central</p>
            <p>Acoyapa, Chontales, Nicaragua</p>
            <p>CP 56500</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FaPhone />
            </div>
            <h3>Teléfono</h3>
            <p>+505 2512 3456</p>
            <p>+505 8877 6655</p>
            <p>Lun-Vie: 8am - 5pm</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FaEnvelope />
            </div>
            <h3>Email</h3>
            <p>info@sinergiab2b.com</p>
            <p>soporte@sinergiab2b.com</p>
            <p>ventas@sinergiab2b.com</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FaClock />
            </div>
            <h3>Horario de Atención</h3>
            <p>Lunes a Viernes: 8:00 - 17:00</p>
            <p>Sábados: 9:00 - 13:00</p>
            <p>Domingos: Cerrado</p>
          </div>
        </div>

        {/* Contact Form and Map Section */}
        <div className={styles.contactSection}>
          <div className={styles.formContainer}>
            <h2 className={styles.sectionTitle}>Envíanos un Mensaje</h2>
            <p className={styles.sectionSubtitle}>
              Completa el formulario y te responderemos lo antes posible
            </p>
            
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="nombre">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="telefono">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+505 1234 5678"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="asunto">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                    placeholder="Motivo de contacto"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="mensaje">
                  Mensaje *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <FaPaperPlane />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </div>

          <div className={styles.mapContainer}>
            <iframe
              title="SinergiaB2B Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3913.844472102744!2d-85.178927!3d11.180145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f6c9d5c56789b2f%3A0x3a4b5c6d7e8f9a0b!2sAcoyapa%2C%20Chontales!5e0!3m2!1sen!2sni!4v1234567890123!5m2!1sen!2sni"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className={styles.mapOverlay}>
              <div className={styles.mapBadge}>
                <FaMapMarkerAlt />
                <span>Acoyapa, Chontales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className={styles.socialSection}>
          <h2 className={styles.sectionTitle}>Síguenos en Redes Sociales</h2>
          <p className={styles.sectionSubtitle}>
            Mantente conectado con nuestras novedades y promociones
          </p>
          
          <div className={styles.socialLinks}>
            <a href="https://facebook.com/sinergiab2b" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaFacebook />
              <span>Facebook</span>
            </a>
            <a href="https://instagram.com/sinergiab2b" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaInstagram />
              <span>Instagram</span>
            </a>
            <a href="https://linkedin.com/company/sinergiab2b" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaLinkedin />
              <span>LinkedIn</span>
            </a>
            <a href="https://wa.me/+50582176633" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaWhatsapp />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Preguntas Frecuentes</h2>
          <p className={styles.sectionSubtitle}>
            Encuentra respuestas a las preguntas más comunes sobre nuestra plataforma
          </p>

          <div className={styles.faqGrid}>
            {faqs.map((faq) => (
              <div key={faq.id} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span>{faq.question}</span>
                  {openFaqs.includes(faq.id) ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                <div className={`${styles.faqAnswer} ${openFaqs.includes(faq.id) ? styles.open : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Banner */}
        <div className={styles.supportBanner}>
  <div className={styles.supportContent}>
    <h3>¿Necesitas ayuda adicional?</h3>
    <p>Nuestro equipo de soporte está disponible para ayudarte</p>
    <button 
      className={styles.supportButton} 
      onClick={() => {
        const phoneNumber = '50582176633';
        const message = 'Hola, necesito ayuda con SinergiaB2B. Me gustaría recibir asistencia sobre:';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }}
    >
      <FaWhatsapp />
      Chat por WhatsApp
    </button>
  </div>
</div>
      </div>
    </div>
  );
};

export default Contact;