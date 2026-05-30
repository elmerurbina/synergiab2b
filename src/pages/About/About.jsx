import React from 'react';
import { FaBuilding, FaRocket, FaHandshake, FaBullseye, FaGlobe, FaShieldAlt } from 'react-icons/fa';
import styles from './About.module.css';

const About = () => {
  const stats = [
    { value: '500+', label: 'Empresas Unidas', description: 'Compradores y vendedores activos en nuestra red.' },
    { value: '2,000+', label: 'Productos Catalogados', description: 'Soluciones comerciales de diversos sectores industriales.' },
    { value: '95%', label: 'Satisfacción Comercial', description: 'Efectividad en el contacto directo vía WhatsApp.' }
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
      {/* Hero Header */}
      <div className={styles.aboutHero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Sobre Nosotros</span>
          <h1 className={styles.heroTitle}>
            Transformando la forma de hacer <span className={styles.highlight}>negocios en Nicaragua</span>
          </h1>
          <p className={styles.heroSubtitle}>
            SinergiaB2B es el ecosistema comercial inteligente que conecta de manera directa y eficiente a compradores y proveedores de todo el país.
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className={styles.container}>
        <div className={styles.storySection}>
          <div className={styles.storyText}>
            <h2>¿Quiénes Somos?</h2>
            <p>
              SinergiaB2B nació de la necesidad de modernizar y digitalizar el comercio entre empresas (B2B) en Nicaragua.
              Observamos que los procesos tradicionales de abastecimiento y la búsqueda de proveedores técnicos requerían días de llamadas, correos y cotizaciones físicas sin garantía de éxito.
            </p>
            <p>
              Nuestra plataforma digital consolida catálogos comerciales industriales, de servicios y consumo masivo en un solo motor de búsqueda inteligente.
              Diseñamos SinergiaB2B para que el primer contacto comercial ocurra al instante, permitiendo que cualquier comprador corporativo interactúe directamente con los tomadores de decisiones de las empresas proveedoras sin fricciones operativas.
            </p>
          </div>
          <div className={styles.storyCard}>
            <FaBuilding size={40} className={styles.storyCardIcon} />
            <h3>Impulsado por Tecnología</h3>
            <p>
              Facilitamos filtros por categorías, rangos de precio, ubicaciones geográficas y un sistema integrado de valoraciones que genera un ecosistema autorregulado y altamente profesional.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statDesc}>{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Mission and Vision */}
        <div className={styles.missionVisionGrid}>
          <div className={styles.mvCard}>
            <div className={styles.mvHeader}>
              <FaBullseye className={styles.mvIcon} />
              <h2>Nuestra Misión</h2>
            </div>
            <p>
              Proporcionar soluciones tecnológicas de vanguardia que simplifiquen el abastecimiento B2B nicaragüense, permitiendo a las pymes y corporaciones expandir su visibilidad, optimizar sus costos y cerrar acuerdos comerciales confiables al instante.
            </p>
          </div>

          <div className={styles.mvCard}>
            <div className={styles.mvHeader}>
              <FaRocket className={styles.mvIcon} />
              <h2>Nuestra Visión</h2>
            </div>
            <p>
              Ser la plataforma tecnológica B2B líder en Centroamérica, reconocida por democratizar el acceso al mercado digital para proveedores locales y por crear la red de encadenamiento productivo más robusta e integrada de la región.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className={styles.valuesSection}>
          <h2 className={styles.valuesTitle}>Nuestros Valores Pilares</h2>
          <div className={styles.valuesGrid}>
            {values.map((val, idx) => (
              <div key={idx} className={styles.valueCard}>
                <div className={styles.valueIcon}>{val.icon}</div>
                <h3 className={styles.valueTitle}>{val.title}</h3>
                <p className={styles.valueDesc}>{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
