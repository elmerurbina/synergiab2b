import React, { useState, useEffect } from 'react';
import { providerAPI } from '../../services/api';
import { FaBuilding, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaWhatsapp, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import styles from './ProvidersSection.module.css';

const ProvidersSection = ({ onSelectProvider }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const res = await providerAPI.getProviders();
        // Extract from pagination structure or array
        const list = res.data.results || res.data || [];
        setProviders(list);
      } catch (err) {
        console.error('Error fetching providers for landing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const handleViewProducts = (companyName) => {
    if (onSelectProvider) {
      onSelectProvider(companyName);
      setTimeout(() => {
        const section = document.getElementById('explorar-seccion');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'EP';
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  if (loading && providers.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando proveedores...</p>
      </div>
    );
  }

  if (providers.length === 0) {
    return null; // Don't show anything if no providers
  }

  return (
    <section className={styles.providersSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Nuestros Proveedores</h2>
          <p className={styles.sectionSubtitle}>
            Conecta directamente con empresas, distribuidores y fabricantes locales verificados en Nicaragua.
          </p>
        </div>

        <div className={styles.providersGrid}>
          {providers.map((provider) => {
            const companyName = provider.empresa || provider.username || 'Empresa B2B';
            const phone = provider.telefono || '';
            const email = provider.email || '';
            const address = provider.direccion || 'Nicaragua';
            const hasProfilePic = provider.foto_perfil;

            return (
              <div key={provider.id} className={styles.providerCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatarWrapper}>
                    {hasProfilePic ? (
                      <img src={provider.foto_perfil} alt={companyName} className={styles.avatarImg} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {getInitials(companyName)}
                      </div>
                    )}
                  </div>
                  <div className={styles.badgeContainer}>
                    <span className={styles.verifiedBadge}>
                      <FaCheckCircle className={styles.badgeIcon} /> Verificado
                    </span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.companyName}>{companyName}</h3>
                  <div className={styles.infoList}>
                    {address && (
                      <div className={styles.infoItem}>
                        <FaMapMarkerAlt className={styles.infoIcon} />
                        <span>{address.length > 50 ? `${address.substring(0, 50)}...` : address}</span>
                      </div>
                    )}
                    {phone && (
                      <div className={styles.infoItem}>
                        <FaPhoneAlt className={styles.infoIcon} />
                        <span>{phone}</span>
                      </div>
                    )}
                    {email && (
                      <div className={styles.infoItem}>
                        <FaEnvelope className={styles.infoIcon} />
                        <span>{email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button 
                    onClick={() => handleViewProducts(companyName)} 
                    className={styles.viewProductsBtn}
                  >
                    Ver Catálogo <FaChevronRight size={10} style={{ marginLeft: '4px' }} />
                  </button>
                  
                  {phone && (
                    <a 
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(companyName)},%20te%20contacto%20desde%20SinergiaB2B.`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.whatsappBtn}
                    >
                      <FaWhatsapp /> Contactar
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProvidersSection;
