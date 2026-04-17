import React, { useState } from 'react';
import {
  FaSearch,
  FaRocket,
  FaChartLine,
  FaBuilding,
  FaUsers,
  FaBoxes,
  FaFilter,
  FaWhatsapp,
  FaShieldAlt,
  FaTachometerAlt,
  FaCheckCircle,
  FaStore,
  FaChartBar,
  FaHeadset,
  FaUserCheck,
  FaMoneyBillWave,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaTrophy,
  FaHandshake,
  FaPercentage,
  FaGem,
  FaArrowRight
} from 'react-icons/fa';
import styles from './ProductsSection.module.css';

const ProductsSection = () => {
  const [activeTab, setActiveTab] = useState('productos');

  const tabs = [
    { id: 'productos', label: 'Productos', icon: <FaSearch /> },
    { id: 'como-funciona', label: 'Cómo Funciona', icon: <FaRocket /> },
    { id: 'precios', label: 'Precios', icon: <FaChartLine /> },
    { id: 'proveedores', label: 'Proveedores', icon: <FaBuilding /> },
    { id: 'compradores', label: 'Compradores', icon: <FaUsers /> }
  ];

  // Product features theory
  const productFeatures = [
    {
      icon: <FaBoxes />,
      title: 'Catálogo Estratégico',
      description: 'Exposición de productos y servicios con descripciones técnicas detalladas, imágenes de alta calidad y categorización jerárquica para facilitar la búsqueda.'
    },
    {
      icon: <FaFilter />,
      title: 'Búsqueda Avanzada',
      description: 'Filtros inteligentes por categorías industriales, etiquetas de productos, rangos de precios y ubicación geográfica del proveedor.'
    },
    {
      icon: <FaWhatsapp />,
      title: 'Integración WhatsApp',
      description: 'Conexión directa con proveedores mediante enlaces de WhatsApp con mensajes pre-llenados que incluyen la referencia del producto consultado.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Proveedores Verificados',
      description: 'Empresas validadas por el equipo de SinergiaB2B para garantizar la legitimidad y profesionalismo del ecosistema comercial.'
    }
  ];

  // Steps theory
  const steps = [
    {
      number: 1,
      icon: <FaSearch />,
      title: 'Búsqueda Inteligente',
      description: 'Utiliza nuestro motor de búsqueda con filtros avanzados para encontrar productos, servicios o proveedores específicos en segundos.'
    },
    {
      number: 2,
      icon: <FaChartBar />,
      title: 'Análisis Comparativo',
      description: 'Compara precios, calificaciones, ubicaciones y trayectoria de diferentes proveedores para tomar decisiones informadas.'
    },
    {
      number: 3,
      icon: <FaWhatsapp />,
      title: 'Contacto Directo',
      description: 'Conecta con el proveedor mediante WhatsApp con un mensaje automatizado que incluye toda la información del producto.'
    },
    {
      number: 4,
      icon: <FaHandshake />,
      title: 'Negociación y Cierre',
      description: 'Negocia directamente los términos del acuerdo y cierra el trato en el canal de comunicación de tu preferencia.'
    }
  ];

  // Pricing models theory
  const pricingModels = [
    {
      icon: <FaGem />,
      title: 'Plan Básico',
      price: 'Gratuito',
      features: ['Perfil básico de empresa', 'Hasta 10 productos', 'Soporte por email', 'Estadísticas básicas']
    },
    {
      icon: <FaTrophy />,
      title: 'Plan Profesional',
      price: 'Desde $49/mes',
      features: ['Perfil personalizado', 'Hasta 100 productos', 'Productos destacados', 'Soporte prioritario', 'Estadísticas avanzadas']
    },
    {
      icon: <FaBuilding />,
      title: 'Plan Empresarial',
      price: 'Desde $99/mes',
      features: ['Perfil premium', 'Productos ilimitados', 'Campañas promocionales', 'Soporte 24/7', 'API de integración']
    }
  ];

  // Supplier benefits theory
  const supplierBenefits = [
    {
      icon: <FaStore />,
      title: 'Visibilidad Estratégica',
      description: 'Aumenta la exposición de tu empresa ante compradores corporativos activos en el mercado nicaragüense.'
    },
    {
      icon: <FaUserCheck />,
      title: 'Clientes Calificados',
      description: 'Conecta con compradores reales que ya tienen una intención de compra específica.'
    },
    {
      icon: <FaChartLine />,
      title: 'Métricas en Tiempo Real',
      description: 'Accede a estadísticas detalladas de visualizaciones, consultas y comportamiento de clientes.'
    },
    {
      icon: <FaHeadset />,
      title: 'Soporte Dedicado',
      description: 'Recibe asesoría personalizada para optimizar tu perfil y maximizar tus oportunidades de negocio.'
    }
  ];

  const requirements = [
    'Registro legal de la empresa (RUC)',
    'Número de contacto verificable',
    'Información corporativa completa',
    'Productos o servicios claramente definidos'
  ];

  // Buyer advantages theory
  const buyerAdvantages = [
    {
      icon: <FaClock />,
      title: 'Reducción de Tiempos',
      description: 'Reduce de días a segundos el proceso de búsqueda y contacto con proveedores potenciales.'
    },
    {
      icon: <FaMoneyBillWave />,
      title: 'Optimización de Costos',
      description: 'Compara múltiples proveedores y encuentra las mejores condiciones del mercado.'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Proveedores Locales',
      description: 'Prioriza proveedores nacionales para reducir costos logísticos y tiempos de entrega.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Seguridad en Transacciones',
      description: 'Empresas verificadas y calificadas por otros compradores de la plataforma.'
    }
  ];

  const buyerProcess = [
    { step: 1, text: 'Buscar productos' },
    { step: 2, text: 'Comparar opciones' },
    { step: 3, text: 'Contactar proveedor' },
    { step: 4, text: 'Negociar y comprar' }
  ];

  const renderProductosTab = () => (
    <div className={styles.productsTheory}>
      <div className={styles.theoryTitle}>
        <FaSearch /> Gestión de Productos y Servicios
      </div>
      <p className={styles.theoryDescription}>
        SinergiaB2B ofrece un sistema integral de gestión de catálogos diseñado específicamente
        para el entorno empresarial B2B. Los proveedores pueden cargar sus productos con
        especificaciones técnicas detalladas, mientras que los compradores acceden a un motor
        de búsqueda optimizado que facilita el descubrimiento de soluciones comerciales.
      </p>

      <div className={styles.featuresGrid}>
        {productFeatures.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComoFuncionaTab = () => (
    <>
      <div className={styles.stepsContainer}>
        {steps.map(step => (
          <div key={step.number} className={styles.stepCard}>
            <div className={styles.stepNumber}>{step.number}</div>
            <div className={styles.stepIcon}>{step.icon}</div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        ))}
      </div>
    </>
  );

  const renderPreciosTab = () => (
    <div className={styles.pricingTheory}>
      <p className={styles.pricingDescription}>
        SinergiaB2B ofrece modelos de precios flexibles y escalables que se adaptan a las
        necesidades y el tamaño de cada empresa. Desde planes gratuitos para pequeños negocios
        hasta soluciones empresariales con funcionalidades avanzadas y soporte prioritario.
      </p>

      <div className={styles.pricingModels}>
        {pricingModels.map((model, index) => (
          <div key={index} className={styles.pricingModelCard}>
            <div className={styles.modelIcon}>{model.icon}</div>
            <h3 className={styles.modelTitle}>{model.title}</h3>
            <div className={styles.modelPrice}>{model.price}</div>
            <ul className={styles.modelFeatures}>
              {model.features.map((feature, idx) => (
                <li key={idx} className={styles.modelFeature}>
                  <FaCheckCircle color="#2E7D32" size={14} /> {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProveedoresTab = () => (
    <div className={styles.proveedoresTheory}>
      <div className={styles.theoryTitle}>
        <FaBuilding /> Beneficios para Proveedores
      </div>
      <p className={styles.theoryDescription}>
        SinergiaB2B empodera a los proveedores nicaragüenses proporcionándoles las herramientas
        digitales necesarias para profesionalizar su presencia en línea y conectarse con compradores
        corporativos de manera eficiente y sin complicaciones técnicas.
      </p>

      <div className={styles.benefitsList}>
        {supplierBenefits.map((benefit, index) => (
          <div key={index} className={styles.benefitItem}>
            <div className={styles.benefitIcon}>{benefit.icon}</div>
            <div className={styles.benefitContent}>
              <h4>{benefit.title}</h4>
              <p>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.requirements}>
        <div className={styles.requirementsTitle}>
          <FaCheckCircle /> Requisitos para Proveedores
        </div>
        <ul className={styles.requirementsList}>
          {requirements.map((req, index) => (
            <li key={index}>
              <FaCheckCircle color="#2E7D32" size={14} /> {req}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderCompradoresTab = () => (
    <div className={styles.compradoresTheory}>
      <div className={styles.theoryTitle}>
        <FaUsers /> Ventajas para Compradores
      </div>
      <p className={styles.theoryDescription}>
        Para los compradores corporativos, SinergiaB2B representa una herramienta estratégica
        que transforma radicalmente el proceso de abastecimiento, eliminando fricciones
        tradicionales y optimizando la cadena de suministro.
      </p>

      <div className={styles.advantagesGrid}>
        {buyerAdvantages.map((advantage, index) => (
          <div key={index} className={styles.advantageCard}>
            <div className={styles.advantageIcon}>{advantage.icon}</div>
            <h4 className={styles.advantageTitle}>{advantage.title}</h4>
            <p className={styles.advantageDescription}>{advantage.description}</p>
          </div>
        ))}
      </div>

      <div className={styles.processSteps}>
        {buyerProcess.map((step) => (
          <div key={step.step} className={styles.processStep}>
            <div className={styles.processNumber}>{step.step}</div>
            <div className={styles.processText}>{step.text}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'productos':
        return renderProductosTab();
      case 'como-funciona':
        return renderComoFuncionaTab();
      case 'precios':
        return renderPreciosTab();
      case 'proveedores':
        return renderProveedoresTab();
      case 'compradores':
        return renderCompradoresTab();
      default:
        return renderProductosTab();
    }
  };

  return (
    <section className={styles.productsSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Todo lo que necesitas para crecer
          </h2>
          <p className={styles.sectionSubtitle}>
            Soluciones integrales para conectar tu negocio con oportunidades reales
          </p>
        </div>

        <div className={styles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {renderActiveTab()}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;