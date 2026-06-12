import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { productAPI, categoryAPI, interactionAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import { 
  FaBox, FaEye, FaHeart, FaChartLine, FaStar,
  FaExclamationTriangle, FaCheckCircle, FaClock,
  FaPlus, FaEdit, FaTrash, FaEye as FaEyeIcon,
  FaChartBar, FaChartPie, FaCalendarAlt
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import styles from './DashboardProveedor.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardProveedor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [visitsData, setVisitsData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [stats, setStats] = useState({
    total_products: 0,
    active_products: 0,
    inactive_products: 0,
    pending_products: 0,
    total_visits: 0,
    average_rating: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load products
      const productsResponse = await productAPI.getMyProducts();
      console.log('Products response:', productsResponse.data);
      
      let productsData = [];
      if (productsResponse.data) {
        if (Array.isArray(productsResponse.data)) {
          productsData = productsResponse.data;
        } else if (productsResponse.data.results && Array.isArray(productsResponse.data.results)) {
          productsData = productsResponse.data.results;
        } else if (productsResponse.data.data && Array.isArray(productsResponse.data.data)) {
          productsData = productsResponse.data.data;
        }
      }
      
      // Load categories to map category names
      const categoriesResponse = await categoryAPI.getCategories();
      console.log('Categories response:', categoriesResponse.data);
      
      let categoriesData = [];
      if (categoriesResponse.data) {
        if (Array.isArray(categoriesResponse.data)) {
          categoriesData = categoriesResponse.data;
        } else if (categoriesResponse.data.results && Array.isArray(categoriesResponse.data.results)) {
          categoriesData = categoriesResponse.data.results;
        }
      }
      
      // Create category map for quick lookup
      const categoryMap = new Map();
      categoriesData.forEach(cat => {
        categoryMap.set(cat.id, cat);
      });
      
      // Enhance products with category info
      const enhancedProducts = productsData.map(product => ({
        ...product,
        categoria_info: product.categoria_info || categoryMap.get(product.categoria) || null,
        categoria_nombre: product.categoria_info?.nombre || categoryMap.get(product.categoria)?.nombre || 'Sin categoría'
      }));
      
      setProducts(enhancedProducts);
      setCategories(categoriesData);
      
      // Calculate stats
      const totalProducts = enhancedProducts.length;
      const activeProducts = enhancedProducts.filter(p => p.estado === 'activo').length;
      const inactiveProducts = enhancedProducts.filter(p => p.estado === 'inactivo').length;
      const pendingProducts = enhancedProducts.filter(p => p.estado === 'pendiente').length;
      const totalVisits = enhancedProducts.reduce((sum, p) => sum + (p.visitas || 0), 0);
      
      // Calculate average rating
      let totalRating = 0;
      let totalRatings = 0;
      enhancedProducts.forEach(product => {
        if (product.promedio_valoracion && product.promedio_valoracion > 0) {
          totalRating += product.promedio_valoracion;
          totalRatings++;
        }
      });
      const averageRating = totalRatings > 0 ? totalRating / totalRatings : 0;
      
      setStats({
        total_products: totalProducts,
        active_products: activeProducts,
        inactive_products: inactiveProducts,
        pending_products: pendingProducts,
        total_visits: totalVisits,
        average_rating: averageRating
      });

      // Get top products by visits
      const topProductsData = [...enhancedProducts]
        .sort((a, b) => (b.visitas || 0) - (a.visitas || 0))
        .slice(0, 5);
      setTopProducts(topProductsData);

      // Get category statistics
      const categoryStatsMap = new Map();
      enhancedProducts.forEach(product => {
        const catName = product.categoria_nombre || 'Sin categoría';
        categoryStatsMap.set(catName, (categoryStatsMap.get(catName) || 0) + 1);
      });
      const categoryStatsData = Array.from(categoryStatsMap.entries()).map(([name, count]) => ({
        name,
        count
      }));
      setCategoryStats(categoryStatsData);

      // Generate visits trend data (simulated - replace with real API data)
      const generateTrendData = () => {
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12;
        const labels = [];
        const data = [];
        
        // Use actual product visit data to generate realistic trend
        const visitsArray = enhancedProducts.map(p => p.visitas || 0);
        const avgVisits = visitsArray.length > 0 ? visitsArray.reduce((a, b) => a + b, 0) / visitsArray.length : 10;
        
        for (let i = 0; i < days; i++) {
          if (timeRange === 'week') {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            labels.push(date.toLocaleDateString('es-ES', { weekday: 'short' }));
          } else if (timeRange === 'month') {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            labels.push(date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
          } else {
            labels.push(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i]);
          }
          
          // Generate realistic data based on average visits
          const variation = Math.sin(i / 3) * (avgVisits * 0.3);
          data.push(Math.max(1, Math.floor(avgVisits + variation + Math.random() * (avgVisits * 0.2))));
        }
        
        return { labels, data };
      };
      
      const trendData = generateTrendData();
      setVisitsData(trendData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${productName}"?`)) return;
    
    try {
      await productAPI.deleteProduct(productId);
      toast.success('Producto eliminado exitosamente');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const handleCreateProduct = () => {
    navigate('/manage-catalog');
  };

  // Chart configurations
  const visitsChartData = {
    labels: visitsData.labels || [],
    datasets: [
      {
        label: 'Visitas',
        data: visitsData.data || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const topProductsChartData = {
    labels: topProducts.map(p => p.nombre?.substring(0, 20) || 'Producto'),
    datasets: [
      {
        label: 'Visitas',
        data: topProducts.map(p => p.visitas || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
      }
    ]
  };

  const categoryChartData = {
    labels: categoryStats.map(c => c.name.length > 15 ? c.name.substring(0, 12) + '...' : c.name),
    datasets: [
      {
        data: categoryStats.map(c => c.count),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#06B6D4',
          '#84CC16',
          '#F97316',
          '#14B8A6',
        ],
        borderWidth: 0,
      }
    ]
  };

  const statusChartData = {
    labels: ['Activos', 'Inactivos', 'Pendientes'],
    datasets: [
      {
        data: [stats.active_products, stats.inactive_products, stats.pending_products],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          color: getComputedStyle(document.documentElement).getPropertyValue('--gray-500') || '#64748b',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--gray-400') || '#757575',
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--gray-400') || '#757575',
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          color: getComputedStyle(document.documentElement).getPropertyValue('--gray-500') || '#64748b',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        cornerRadius: 8,
      }
    },
    cutout: '60%',
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={styles.statCard}>
      <div className={styles.statCardContent}>
        <div className={styles.statInfo}>
          <p className={styles.statTitle}>{title}</p>
          <p className={styles.statValue}>{value}</p>
        </div>
        <div className={styles.statIcon} style={{ backgroundColor: color }}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>
            Dashboard de {user?.empresa || user?.username}
          </h1>
          <p className={styles.dashboardSubtitle}>
            Bienvenido de vuelta. Aquí está el resumen de tu negocio.
          </p>
        </div>
        <button onClick={handleCreateProduct} className={styles.createProductBtn}>
          <FaPlus /> Crear Nuevo Producto
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Productos"
          value={stats.total_products}
          icon={<FaBox size={24} />}
          color="#3B82F6"
        />
        <StatCard
          title="Productos Activos"
          value={stats.active_products}
          icon={<FaCheckCircle size={24} />}
          color="#10B981"
        />
        <StatCard
          title="Total Visitas"
          value={stats.total_visits.toLocaleString()}
          icon={<FaEye size={24} />}
          color="#8B5CF6"
        />
        <StatCard
          title="Valoración Promedio"
          value={stats.average_rating.toFixed(1)}
          icon={<FaStar size={24} />}
          color="#F59E0B"
        />
      </div>

      {/* Second Row Stats */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Productos Inactivos"
          value={stats.inactive_products}
          icon={<FaExclamationTriangle size={24} />}
          color="#EF4444"
        />
        <StatCard
          title="Pendientes"
          value={stats.pending_products}
          icon={<FaClock size={24} />}
          color="#F59E0B"
        />
        <StatCard
          title="Interacciones"
          value={products.reduce((sum, p) => sum + (p.visitas || 0), 0).toLocaleString()}
          icon={<FaHeart size={24} />}
          color="#EC4899"
        />
        <StatCard
          title="Valoraciones"
          value={products.filter(p => p.promedio_valoracion > 0).length}
          icon={<FaStar size={24} />}
          color="#06B6D4"
        />
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        {/* Visits Trend Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3>
                <FaChartLine /> Tendencia de Visitas
              </h3>
              <p className={styles.chartSubtitle}>Evolución de visitas en el tiempo</p>
            </div>
            <div className={styles.timeRangeSelector}>
              <button 
                className={`${styles.timeBtn} ${timeRange === 'week' ? styles.active : ''}`}
                onClick={() => setTimeRange('week')}
              >
                Semana
              </button>
              <button 
                className={`${styles.timeBtn} ${timeRange === 'month' ? styles.active : ''}`}
                onClick={() => setTimeRange('month')}
              >
                Mes
              </button>
              <button 
                className={`${styles.timeBtn} ${timeRange === 'year' ? styles.active : ''}`}
                onClick={() => setTimeRange('year')}
              >
                Año
              </button>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {visitsData.data && visitsData.data.length > 0 ? (
              <Line data={visitsChartData} options={chartOptions} />
            ) : (
              <div className={styles.chartEmpty}>
                <p>No hay datos de visitas disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Grid */}
        <div className={styles.chartsGrid}>
          {/* Top Products Chart */}
          <div className={styles.chartCard}>
            <h3>
              <FaChartBar /> Productos Más Visitados
            </h3>
            <div className={styles.chartContainerSmall}>
              {topProducts.length > 0 ? (
                <Bar data={topProductsChartData} options={chartOptions} />
              ) : (
                <div className={styles.chartEmpty}>
                  <p>No hay productos con visitas</p>
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className={styles.chartCard}>
            <h3>
              <FaChartPie /> Productos por Categoría
            </h3>
            <div className={styles.chartContainerSmall}>
              {categoryStats.length > 0 ? (
                <Doughnut data={categoryChartData} options={doughnutOptions} />
              ) : (
                <div className={styles.chartEmpty}>
                  <p>No hay datos de categorías</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Chart */}
        <div className={styles.chartCard}>
          <h3>
            <FaBox /> Estado de Productos
          </h3>
          <div className={styles.chartContainerSmall}>
            <Doughnut data={statusChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h3>
            <FaChartLine /> Mis Productos
          </h3>
          <button 
            className={styles.viewAllBtn}
            onClick={() => navigate('/manage-catalog')}
          >
            Ver Todos
          </button>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Visitas</th>
                <th>Valoración</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product.id}>
                  <td className={styles.productCell}>
                    <div className={styles.productInfo}>
                      {product.imagen_principal ? (
                        <img 
                          src={product.imagen_principal} 
                          alt={product.nombre}
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.productImagePlaceholder}>📦</div>
                      )}
                      <span className={styles.productName}>{product.nombre}</span>
                    </div>
                  </td>
                  <td className={styles.categoryCell}>
                    <span className={styles.categoryBadge}>
                      {product.categoria_nombre || 'Sin categoría'}
                    </span>
                  </td>
                  <td className={styles.priceCell}>C$ {parseFloat(product.precio).toFixed(2)}</td>
                  <td className={styles.stockCell}>
                    <span className={`${styles.stockBadge} ${product.stock > 0 ? styles.inStock : styles.outStock}`}>
                      {product.stock > 0 ? `${product.stock} unidades` : 'Sin stock'}
                    </span>
                  </td>
                  <td className={styles.visitsCell}>{product.visitas || 0}</td>
                  <td className={styles.ratingCell}>
                    <div className={styles.stars}>
                      {'★'.repeat(Math.floor(product.promedio_valoracion || 0))}
                      {'☆'.repeat(5 - Math.floor(product.promedio_valoracion || 0))}
                    </div>
                  </td>
                  <td className={styles.statusCell}>
                    <span className={`${styles.statusBadge} ${styles[product.estado]}`}>
                      {product.estado === 'activo' ? 'Activo' : 
                       product.estado === 'inactivo' ? 'Inactivo' : 'Pendiente'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => navigate(`/producto/${product.id}`)}
                      title="Ver producto"
                    >
                      <FaEyeIcon />
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => navigate(`/manage-catalog?edit=${product.id}`)}
                      title="Editar producto"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteProduct(product.id, product.nombre)}
                      title="Eliminar producto"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="8" className={styles.emptyTable}>
                    <p>No tienes productos aún</p>
                    <button onClick={handleCreateProduct} className={styles.emptyCreateBtn}>
                      Crear mi primer producto
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardProveedor;