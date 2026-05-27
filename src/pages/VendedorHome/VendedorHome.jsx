import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { productAPI, interactionAPI } from '../../services/api';
import { FaBoxes, FaPlus, FaChartBar, FaEye, FaWhatsapp, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from './VendedorHome.module.css';

const VendedorHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalVisits: 0,
    totalClicks: 0,
    totalContacts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch seller products
        const prodRes = await productAPI.getMyProducts();
        const prodList = prodRes.data || [];
        setProducts(prodList);
        
        // Fetch interactions stats
        const statsRes = await interactionAPI.getProviderStats();
        const statsData = statsRes.data || {};
        
        // Calculate totals
        const activeCount = prodList.filter(p => p.estado === 'activo').length;
        const totalVis = prodList.reduce((acc, p) => acc + (p.visitas || 0), 0);
        
        let clicks = 0;
        let contacts = 0;
        if (statsData.por_producto) {
          clicks = statsData.por_producto.reduce((acc, p) => acc + (p.clicks || 0), 0);
          contacts = statsData.por_producto.reduce((acc, p) => acc + (p.contactos || 0), 0);
        }

        setStats({
          totalProducts: prodList.length,
          activeProducts: activeCount,
          totalVisits: totalVis,
          totalClicks: clicks,
          totalContacts: contacts
        });
      } catch (err) {
        console.error('Error loading vendor dashboard:', err);
        toast.error('Error al cargar datos del panel');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const recentProducts = products.slice(0, 5);

  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <h1>¡Hola, {user?.empresa || user?.username}!</h1>
          <p>Bienvenido a tu panel de control de SinergiaB2B. Aquí tienes el rendimiento de tu catálogo comercial.</p>
        </div>
        <div className={styles.bannerDate}>
          <FaCalendarAlt /> {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-500)' }}>
            <FaBoxes />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.totalProducts}</h3>
            <p>Productos Totales</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--secondary-100)', color: 'var(--secondary-500)' }}>
            <FaBoxes />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.activeProducts}</h3>
            <p>Productos Activos</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--tertiary-100)', color: 'var(--tertiary-500)' }}>
            <FaEye />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.totalVisits}</h3>
            <p>Visualizaciones Totales</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(245, 124, 0, 0.1)', color: 'var(--warning)' }}>
            <FaWhatsapp />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.totalClicks}</h3>
            <p>Clics en WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Recent Products */}
      <div className={styles.mainGrid}>
        {/* Quick Actions */}
        <div className={styles.cardSection}>
          <h2>Acciones Rápidas</h2>
          <div className={styles.actionsGrid}>
            <button className={styles.actionButton} onClick={() => navigate('/manage-catalog?action=new')}>
              <FaPlus />
              <span>Agregar Producto</span>
            </button>
            <button className={styles.actionButton} onClick={() => navigate('/manage-catalog')}>
              <FaBoxes />
              <span>Gestionar Catálogo</span>
            </button>
            <button className={styles.actionButton} onClick={() => navigate('/dashboard/proveedor')}>
              <FaChartBar />
              <span>Estadísticas Detalladas</span>
            </button>
          </div>
        </div>

        {/* Recent Products */}
        <div className={styles.cardSection}>
          <div className={styles.sectionTitleLink}>
            <h2>Productos Recientes</h2>
            <button onClick={() => navigate('/manage-catalog')}>Ver todos</button>
          </div>

          {loading ? (
            <p>Cargando productos...</p>
          ) : recentProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Aún no tienes productos publicados en tu catálogo.</p>
              <button className={styles.emptyStateBtn} onClick={() => navigate('/manage-catalog?action=new')}>
                Publicar mi primer producto
              </button>
            </div>
          ) : (
            <div className={styles.recentList}>
              {recentProducts.map(product => (
                <div key={product.id} className={styles.recentItem} onClick={() => navigate(`/producto/${product.id}`)}>
                  <div className={styles.recentImage}>
                    {product.imagen_principal ? (
                      <img src={product.imagen_principal} alt={product.nombre} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div className={styles.recentDetails}>
                    <h4>{product.nombre}</h4>
                    <p>{product.categoria_info?.nombre || 'Sin categoría'}</p>
                  </div>
                  <div className={styles.recentPrice}>
                    C$ {product.precio}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendedorHome;
