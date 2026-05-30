import React, { useEffect, useState } from 'react';
import { FaBuilding, FaRocket, FaHandshake, FaBullseye, FaGlobe, FaShieldAlt, FaChartLine, FaUsers, FaBoxes } from 'react-icons/fa';
import styles from './About.module.css';

const About = () => {
  const [isVisible, setIsVisible] = useState({
    stats: false,
    mission: false,
    values: false
  });

  useEffect(() => {
    // Trigger animations on mount
    const timer = setTimeout(() => {
      setIsVisible({
        stats: true,
        mission: true,
        values: true
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { 
      value: '500+', 
      label: 'Empresas Unidas', 
      description: 'Compradores y vendedores activos en nuestra red.',
      icon: <FaUsers />
    },
    { 
      value: '2,000+', 
      label: 'Productos Catalogados', 
      description: 'Soluciones comerciales de diversos sectores industriales.',
      icon: <FaBoxes />
    },
    { 
      value: '95%', 
      label: 'Satisfacción Comercial', 
      description: 'Efectividad en el contacto directo vía WhatsApp.',
      icon: <FaChartLine />
    }
  ];

  const values = [
    {
      icon: <FaShieldAlt />,
      title: 'Transparencia y Seguridad',
      description: 'Promovemos un entorno comercial confiable mediante la verificación rigurosa de empresas proveedoras.'
    },
    {
      icon: <FaHandshake />,
      title: 'Conexión Directa',
      description: 'Eliminamos intermediarios, permitiendo negociaciones ágiles y personalizadas a través de WhatsApp.'
    },
    {
      icon: <FaGlobe />,
      title: 'Impacto Local',
      description: 'Impulsamos el desarrollo económico de Nicaragua facilitando el encadenamiento comercial local.'
    }
  ];

  return (
    <div className={styles.aboutPage}>
      {/* Hero Header with Animation */}
      <div className={styles.aboutHero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroBackground}>
          <div className={styles.heroShape1}></div>
          <div className={styles.heroShape2}></div>
          <div className={styles.heroShape3}></div>
        </div>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>
            <span className={styles.badgeDot}></span>
            Sobre Nosotros
          </span>
          <h1 className={styles.heroTitle}>
            Transformando la forma de hacer 
            <span className={styles.highlight}> negocios en Nicaragua</span>
          </h1>
          <p className={styles.heroSubtitle}>
            SinergiaB2B es el ecosistema comercial inteligente que conecta de manera directa y eficiente 
            a compradores y proveedores de todo el país.
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.heroBtnPrimary}>Conoce Más</button>
            <button className={styles.heroBtnSecondary}>Ver Catálogo</button>
          </div>
        </div>
        <div className={styles.heroScrollIndicator}>
          <div className={styles.scrollMouse}>
            <div className={styles.scrollWheel}></div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className={styles.container}>
        <div className={`${styles.storySection} ${isVisible.stats ? styles.animateSlideUp : ''}`}>
          <div className={styles.storyText}>
            <div className={styles.sectionBadge}>Nuestra Historia</div>
            <h2 className={styles.sectionTitle}>¿Quiénes Somos?</h2>
            <p className={styles.storyParagraph}>
              SinergiaB2B nació de la necesidad de modernizar y digitalizar el comercio entre empresas (B2B) en Nicaragua.
              Observamos que los procesos tradicionales de abastecimiento y la búsqueda de proveedores técnicos requerían días de llamadas, 
              correos y cotizaciones físicas sin garantía de éxito.
            </p>
            <p className={styles.storyParagraph}>
              Nuestra plataforma digital consolida catálogos comerciales industriales, de servicios y consumo masivo en un solo motor de búsqueda inteligente.
              Diseñamos SinergiaB2B para que el primer contacto comercial ocurra al instante, permitiendo que cualquier comprador corporativo 
              interactúe directamente con los tomadores de decisiones de las empresas proveedoras sin fricciones operativas.
            </p>
            <div className={styles.storyFeatures}>
              <div className={styles.feature}>
                <span className={styles.featureCheck}>✓</span>
                <span>Más de 500 empresas activas</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureCheck}>✓</span>
                <span>+2000 productos disponibles</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureCheck}>✓</span>
                <span>95% de satisfacción</span>
              </div>
            </div>
          </div>
          <div className={styles.storyCard}>
            <div className={styles.storyCardIconWrapper}>
              <FaBuilding size={40} className={styles.storyCardIcon} />
            </div>
            <h3 className={styles.storyCardTitle}>Impulsado por Tecnología</h3>
            <p className={styles.storyCardText}>
              Facilitamos filtros por categorías, rangos de precio, ubicaciones geográficas y un sistema integrado de valoraciones 
              que genera un ecosistema autorregulado y altamente profesional.
            </p>
            <div className={styles.storyCardGlow}></div>
          </div>
        </div>

        {/* Stats Grid with Animation */}
        <div className={`${styles.statsGrid} ${isVisible.stats ? styles.animateFadeInUp : ''}`}>
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className={styles.statCard}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={styles.statIconWrapper}>
                {stat.icon}
              </div>
              <div className={styles.statValue}>
                <span className={styles.counter} data-target={stat.value}>
                  {stat.value}
                </span>
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statDesc}>{stat.description}</div>
              <div className={styles.statHoverEffect}></div>
            </div>
          ))}
        </div>

        {/* Mission and Vision with Animation */}
        <div className={`${styles.missionVisionGrid} ${isVisible.mission ? styles.animateScaleIn : ''}`}>
          <div className={styles.mvCard}>
            <div className={styles.mvHeader}>
              <div className={styles.mvIconWrapper}>
                <FaBullseye className={styles.mvIcon} />
              </div>
              <h2 className={styles.mvTitle}>Nuestra Misión</h2>
            </div>
            <p className={styles.mvText}>
              Proporcionar soluciones tecnológicas de vanguardia que simplifiquen el abastecimiento B2B nicaragüense, 
              permitiendo a las pymes y corporaciones expandir su visibilidad, optimizar sus costos y cerrar acuerdos 
              comerciales confiables al instante.
            </p>
            <div className={styles.mvDecoration}></div>
          </div>

          <div className={`${styles.mvCard} ${styles.mvCardReverse}`}>
            <div className={styles.mvHeader}>
              <div className={styles.mvIconWrapper}>
                <FaRocket className={styles.mvIcon} />
              </div>
              <h2 className={styles.mvTitle}>Nuestra Visión</h2>
            </div>
            <p className={styles.mvText}>
              Ser la plataforma tecnológica B2B líder en Centroamérica, reconocida por democratizar el acceso al mercado digital 
              para proveedores locales y por crear la red de encadenamiento productivo más robusta e integrada de la región.
            </p>
            <div className={styles.mvDecoration}></div>
          </div>
        </div>

        {/* Values Section with Animation */}
        <div className={`${styles.valuesSection} ${isVisible.values ? styles.animateSlideUp : ''}`}>
          <div className={styles.valuesHeader}>
            <div className={styles.sectionBadge}>Nuestros Pilares</div>
            <h2 className={styles.valuesTitle}>Valores que nos <span className={styles.highlight}>Impulsan</span></h2>
            <p className={styles.valuesSubtitle}>
              Estos valores fundamentales guían cada decisión y cada conexión que facilitamos en nuestra plataforma.
            </p>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((val, idx) => (
              <div 
                key={idx} 
                className={styles.valueCard}
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className={styles.valueIconWrapper}>
                  <div className={styles.valueIcon}>{val.icon}</div>
                  <div className={styles.valueIconGlow}></div>
                </div>
                <h3 className={styles.valueTitle}>{val.title}</h3>
                <p className={styles.valueDesc}>{val.description}</p>
                <div className={styles.valueLink}>
                  <span>Saber más</span>
                  <span className={styles.valueLinkArrow}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>¿Listo para transformar tu negocio?</h2>
            <p className={styles.ctaText}>
              Únete a SinergiaB2B y descubre un nuevo mundo de oportunidades comerciales.
            </p>
            <button className={styles.ctaButton}>
              Comienza Ahora
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;