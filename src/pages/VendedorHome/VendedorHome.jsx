import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { productAPI, interactionAPI } from '../../services/api';
import {
  FaBoxes, FaPlus, FaChartBar, FaEye, FaWhatsapp,
  FaCalendarAlt, FaCheck, FaUsers, FaTrophy
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import AnalyticsChart from './AnalyticsChart';
import styles from './VendedorHome.module.css';

const VendedorHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalVisits: 0,
    totalClicks: 0,
    totalContacts: 0,
    totalInteractions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');

  useEffect(() => {
    loadDashboardData(periodo);
  }, [periodo]);

  const loadDashboardData = async (p) => {
    setLoading(true);
    try {
      // --- Products ---
      const prodRes = await productAPI.getMyProducts();
      let prodList = [];
      if (prodRes?.data) {
        if (Array.isArray(prodRes.data)) {
          prodList = prodRes.data;
        } else if (prodRes.data.results && Array.isArray(prodRes.data.results)) {
          prodList = prodRes.data.results;
        }
      }
      setProducts(prodList);

      // --- Interaction stats from new fixed endpoint ---
      const statsRes = await interactionAPI.getProviderStats({ periodo: p });
      const statsData = statsRes?.data || {};

      // Aggregate from por_producto
      let totalVistas = 0;
      let totalClicks = 0;
      let totalContactos = 0;

      const perProduct = statsData.por_producto || [];
      if (Array.isArray(perProduct)) {
        perProduct.forEach(item => {
          totalVistas  += (item?.vistas      || 0);
          totalClicks  += (item?.clicks      || 0);
          totalContactos += (item?.contactos  || 0);
        });
      }

      const activeCount = Array.isArray(prodList)
        ? prodList.filter(p => p?.estado === 'activo').length
        : 0;

      setStats({
        totalProducts:    Array.isArray(prodList) ? prodList.length : 0,
        activeProducts:   activeCount,
        totalVisits:      totalVistas || statsData.total_interacciones || 0,
        totalClicks:      totalClicks,
        totalContacts:    totalContactos,
        totalInteractions: statsData.total_interacciones || 0,
      });

      // --- Chart trend data ---
      const trend = statsData.tendencia_diaria || [];
      setChartData(Array.isArray(trend) ? trend : []);

    } catch (err) {
      console.error('Error loading vendor dashboard:', err);
      toast.error('Error al cargar datos del panel');
      setProducts([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const recentProducts = Array.isArray(products) ? products.slice(0, 5) : [];

  const statCards = [
    {
      icon: <FaBoxes />,
      value: stats.totalProducts,
      label: 'Productos Totales',
      bg: 'var(--primary-100)',
      color: 'var(--primary-500)',
    },
    {
      icon: <FaCheck />,
      value: stats.activeProducts,
      label: 'Activos',
      bg: 'var(--secondary-100)',
      color: 'var(--secondary-500)',
    },
    {
      icon: <FaEye />,
      value: stats.totalVisits,
      label: 'Vistas',
      bg: 'var(--tertiary-100)',
      color: 'var(--tertiary-500)',
    },
    {
      icon: <FaWhatsapp />,
      value: stats.totalClicks,
      label: 'Clicks WhatsApp',
      bg: 'rgba(37,211,102,0.1)',
      color: '#25D366',
    },
    {
      icon: <FaUsers />,
      value: stats.totalContacts,
      label: 'Contactos',
      bg: 'rgba(245,124,0,0.1)',
      color: 'var(--warning)',
    },
    {
      icon: <FaTrophy />,
      value: stats.totalInteractions,
      label: 'Total Interacciones',
      bg: 'rgba(123,31,162,0.1)',
      color: 'var(--tertiary-500)',
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <h1>¡Hola, {user?.empresa || user?.username}!</h1>
          <p>Panel de control de SinergiaB2B — Rendimiento de tu catálogo comercial.</p>
        </div>
        <div className={styles.bannerDate}>
          <FaCalendarAlt />
          {' '}{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((card, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className={styles.statInfo}>
              <h3>{loading ? '—' : card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart Section */}
      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>
              <FaChartBar style={{ marginRight: '8px', color: 'var(--primary-500)' }} />
              Tendencia de Actividad
            </h2>
            <p className={styles.chartSubtitle}>Vistas y clicks de WhatsApp en el período seleccionado</p>
          </div>

          {/* Period Selector */}
          <div className={styles.periodSelector}>
            {['dia', 'semana', 'mes', 'año'].map(p => (
              <button
                key={p}
                className={`${styles.periodBtn} ${periodo === p ? styles.activePeriod : ''}`}
                onClick={() => setPeriodo(p)}
              >
                {p === 'dia' ? '7 días' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.chartBody}>
          {loading ? (
            <div className={styles.chartLoading}>
              <div className={styles.spinner}></div>
              <p>Cargando estadísticas...</p>
            </div>
          ) : (
            <AnalyticsChart data={chartData} />
          )}
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
          ) : !Array.isArray(recentProducts) || recentProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Aún no tienes productos publicados en tu catálogo.</p>
              <button className={styles.emptyStateBtn} onClick={() => navigate('/manage-catalog?action=new')}>
                Publicar mi primer producto
              </button>
            </div>
          ) : (
            <div className={styles.recentList}>
              {recentProducts.map(product => (
                <div
                  key={product.id || Math.random()}
                  className={styles.recentItem}
                  onClick={() => navigate(`/producto/${product.id}`)}
                >
                  <div className={styles.recentImage}>
                    {product.imagen_principal ? (
                      <img src={product.imagen_principal} alt={product.nombre || 'Producto'} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div className={styles.recentDetails}>
                    <h4>{product.nombre || 'Sin nombre'}</h4>
                    <p>{product.categoria_info?.nombre || 'Sin categoría'}</p>
                  </div>
                  <div className={styles.recentPrice}>
                    C$ {product.precio || '0'}
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