import React, { useState } from 'react';
import styles from './Testimonials.module.css';

const testimonialsData = [
  {
    id: 1,
    name: 'Carlos Mendoza',
    role: 'Gerente de Compras',
    company: 'Distribuidora La Fiel, S.A.',
    avatar: '👨‍💼',
    rating: 5,
    text: 'SinergiaB2B ha transformado radicalmente nuestro proceso de abastecimiento. Logramos contactar a tres nuevos proveedores locales en menos de una semana, reduciendo costos de logística en un 15%.'
  },
  {
    id: 2,
    name: 'María Alejandra Rostrán',
    role: 'Directora Comercial',
    company: 'AgroNica S.A.',
    avatar: '👩‍💼',
    rating: 5,
    text: 'Como proveedores de maquinaria agrícola, encontrar compradores calificados en Nicaragua solía tomar meses. Con la plataforma recibimos solicitudes directas y cerramos ventas en tiempo récord.'
  },
  {
    id: 3,
    name: 'Roberto Gómez',
    role: 'Fundador y CEO',
    company: 'NicaTech Soluciones',
    avatar: '👨‍💻',
    rating: 4,
    text: 'La facilidad de interactuar, valorar y guardar productos favoritos nos permite preseleccionar ofertas antes de tomar la decisión final. Altamente recomendada para PYMEs.'
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonialsData.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonialsData.length) % testimonialsData.length);
  };

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Testimonios reales</span>
          <h2 className={styles.title}>Lo que dicen nuestros clientes</h2>
          <div className={styles.underline}></div>
        </div>

        <div className={styles.carouselContainer}>
          <button onClick={prevTestimonial} className={`${styles.navButton} ${styles.prev}`} aria-label="Anterior">
            ‹
          </button>
          
          <div className={styles.cardWrapper}>
            {testimonialsData.map((testimonial, index) => {
              let position = styles.nextSlide;
              if (index === activeIndex) {
                position = styles.activeSlide;
              } else if (
                index === activeIndex - 1 ||
                (activeIndex === 0 && index === testimonialsData.length - 1)
              ) {
                position = styles.prevSlide;
              }

              return (
                <div key={testimonial.id} className={`${styles.testimonialCard} ${position}`}>
                  <div className={styles.quoteIcon}>“</div>
                  <p className={styles.text}>{testimonial.text}</p>
                  
                  <div className={styles.rating}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < testimonial.rating ? styles.starFilled : styles.starEmpty}>
                        ★
                      </span>
                    ))}
                  </div>

                  <div className={styles.profile}>
                    <span className={styles.avatar}>{testimonial.avatar}</span>
                    <div className={styles.info}>
                      <h4 className={styles.name}>{testimonial.name}</h4>
                      <p className={styles.role}>
                        {testimonial.role} — <span className={styles.company}>{testimonial.company}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={nextTestimonial} className={`${styles.navButton} ${styles.next}`} aria-label="Siguiente">
            ›
          </button>
        </div>

        <div className={styles.dots}>
          {testimonialsData.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''}`}
              aria-label={`Ir al testimonio ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
