import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { productAPI, providerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaStore, FaWhatsapp, FaArrowLeft, FaStar, FaEye, FaShoppingCart } from 'react-icons/fa';
import styles from './ProviderCatalog.module.css';

const ProviderCatalog = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    total_products: 0,
    average_rating: 0,
    total_ratings: 0
  });

  useEffect(() => {
    loadProviderCatalog();
  }, [providerId]);

  const loadProviderCatalog = async () => {
    setLoading(true);
    try {
      // Load provider info
      const providerResponse = await providerAPI.getProvider(providerId);
      console.log('Provider response:', providerResponse.data);
      setProvider(providerResponse.data);

      // Load provider's products
      const productsResponse = await productAPI.getProducts({ proveedor: providerId });
      console.log('Products response:', productsResponse.data);
      
      let productsData = [];
      if (productsResponse.data) {
        if (Array.isArray(productsResponse.data)) {
          productsData = productsResponse.data;
        } else if (productsResponse.data.results && Array.isArray(productsResponse.data.results)) {
          productsData = productsResponse.data.results;
        }
      }
      
      setProducts(productsData);
      
      // Calculate stats
      const totalProducts = productsData.length;
      let totalRating = 0;
      let totalRatings = 0;
      productsData.forEach(product => {
        if (product.promedio_valoracion && product.promedio_valoracion > 0) {
          totalRating += product.promedio_valoracion;
          totalRatings++;
        }
      });
      const averageRating = totalRatings > 0 ? totalRating / totalRatings : 0;
      
      setStats({
        total_products: totalProducts,
        average_rating: averageRating,
        total_ratings: totalRatings
      });
      
    } catch (error) {
      console.error('Error loading provider catalog:', error);
      toast.error('Error al cargar el catálogo del proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = provider?.telefono || '';
    const message = `Hola, vi tu catálogo en SinergiaB2B y estoy interesado en tus productos.`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className={styles.errorContainer}>
        <h2>Proveedor no encontrado</h2>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className={styles.catalogContainer}>
      {/* Header Section */}
      <div className={styles.providerHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FaArrowLeft /> Volver
        </button>
        
        <div className={styles.providerInfo}>
          <div className={styles.providerAvatar}>
            {provider.profile_image ? (
              <img src={provider.profile_image} alt={provider.empresa || provider.username} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <FaStore size={40} />
              </div>
            )}
          </div>
          
          <div className={styles.providerDetails}>
            <h1>{provider.empresa || provider.username}</h1>
            <div className={styles.providerMeta}>
              {provider.ubicacion && (
                <span className={styles.metaItem}>📍 {provider.ubicacion}</span>
              )}
              {stats.total_products > 0 && (
                <span className={styles.metaItem}>📦 {stats.total_products} productos</span>
              )}
              {stats.average_rating > 0 && (
                <span className={styles.metaItem}>
                  ⭐ {stats.average_rating.toFixed(1)} ({stats.total_ratings} valoraciones)
                </span>
              )}
            </div>
            {provider.descripcion && (
              <p className={styles.providerDescription}>{provider.descripcion}</p>
            )}
          </div>
          
          <button onClick={handleWhatsAppContact} className={styles.whatsappButton}>
            <FaWhatsapp /> Contactar por WhatsApp
          </button>
        </div>
      </div>

      {/* Products Section */}
      <div className={styles.productsSection}>
        <h2>Catálogo de Productos</h2>
        
        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Este proveedor aún no tiene productos publicados.</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <div 
                key={product.id} 
                className={styles.productCard}
                onClick={() => navigate(`/producto/${product.id}`)}
              >
                <div className={styles.productImage}>
                  {product.imagen_principal ? (
                    <img src={product.imagen_principal} alt={product.nombre} />
                  ) : (
                    <div className={styles.imagePlaceholder}>📦</div>
                  )}
                </div>
                
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.nombre}</h3>
                  <p className={styles.productDesc}>
                    {product.descripcion_corta || product.descripcion?.substring(0, 80)}...
                  </p>
                  
                  <div className={styles.productMeta}>
                    <div className={styles.productRating}>
                      {'★'.repeat(Math.floor(product.promedio_valoracion || 0))}
                      {'☆'.repeat(5 - Math.floor(product.promedio_valoracion || 0))}
                      <span>({product.total_valoraciones || 0})</span>
                    </div>
                    <div className={styles.productVisits}>
                      <FaEye /> {product.visitas || 0}
                    </div>
                  </div>
                  
                  <div className={styles.productPrice}>
                    {product.precio_oferta && product.precio_oferta < product.precio ? (
                      <>
                        <span className={styles.oldPrice}>C$ {parseFloat(product.precio).toFixed(2)}</span>
                        <span className={styles.currentPrice}>C$ {parseFloat(product.precio_oferta).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className={styles.currentPrice}>C$ {parseFloat(product.precio).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderCatalog;