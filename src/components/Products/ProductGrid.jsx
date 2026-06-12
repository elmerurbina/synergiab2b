import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { productAPI, favoriteAPI, categoryAPI } from '../../services/api';
import { toast } from 'react-toastify';
import styles from './ProductGrid.module.css';

const ProductGrid = ({ initialSearch = '' }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [categories, setCategories] = useState([]);
  
  // Filter states
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Sync initialSearch prop with search state
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  // Fetch categories and user favorites on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const catRes = await categoryAPI.getCategories();
        setCategories(catRes.data.results || catRes.data || []);
        
        if (isAuthenticated && user?.rol === 'comprador') {
          const favRes = await favoriteAPI.getFavorites();
          const favList = favRes.data.results || favRes.data || [];
          setFavorites(new Set(favList.map(f => f.producto)));
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };
    loadInitialData();
  }, [isAuthenticated, user]);

  // Fetch products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.categoria = selectedCategory;
      if (minPrice) params.precio_min = minPrice;
      if (maxPrice) params.precio_max = maxPrice;
      
      const res = await productAPI.getProducts(params);
      console.log('Products response:', res.data);
      setProducts(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, minPrice, maxPrice]);

  const handleToggleFavorite = async (e, productId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Inicia sesión para guardar productos en favoritos');
      navigate('/login');
      return;
    }
    if (user?.rol !== 'comprador') {
      toast.warning('Solo los compradores pueden guardar favoritos');
      return;
    }

    const isFav = favorites.has(productId);
    try {
      if (isFav) {
        await favoriteAPI.removeFavorite(productId);
        const newFavs = new Set(favorites);
        newFavs.delete(productId);
        setFavorites(newFavs);
        toast.success('Producto eliminado de favoritos');
      } else {
        await favoriteAPI.addFavorite(productId);
        const newFavs = new Set(favorites);
        newFavs.add(productId);
        setFavorites(newFavs);
        toast.success('Producto guardado en favoritos');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Error al actualizar favorito');
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/producto/${productId}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating || 0);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<span key={i} className={styles.starFilled}>★</span>);
      } else {
        stars.push(<span key={i} className={styles.starEmpty}>★</span>);
      }
    }
    return stars;
  };

  // Get provider display name - Prioritizes empresa name
  const getProviderDisplayName = (product) => {
    // Check if proveedor_empresa exists and is not empty
    if (product.proveedor_empresa && product.proveedor_empresa.trim() !== '') {
      return product.proveedor_empresa;
    }
    // Fallback to proveedor_nombre (username)
    if (product.proveedor_nombre && product.proveedor_nombre.trim() !== '') {
      return product.proveedor_nombre;
    }
    // Last fallback
    return 'Proveedor';
  };

  // Get provider icon based on company name
  const getProviderIcon = (product) => {
    if (product.proveedor_empresa) {
      return '🏢';
    }
    return '🏪';
  };

  return (
    <div id="explorar-seccion" className={styles.catalogContainer}>
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Filtrar Catálogo</h3>
        
        <div className={styles.filterGroup}>
          <label>Búsqueda</label>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Categoría</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Rango de Precios (C$)</label>
          <div className={styles.priceInputs}>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={styles.priceInput}
            />
            <span className={styles.priceSeparator}>-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={styles.priceInput}
            />
          </div>
        </div>
        
        <button
          className={styles.resetButton}
          onClick={() => {
            setSearch('');
            setSelectedCategory('');
            setMinPrice('');
            setMaxPrice('');
          }}
        >
          Limpiar Filtros
        </button>
      </div>

      <div className={styles.productsGridSection}>
        <div className={styles.sectionHeader}>
          <h2>Catálogo de Productos</h2>
          <span className={styles.resultsCount}>
            {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </span>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p className={styles.emptyMessage}>No se encontraron productos con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => {
              const isFav = favorites.has(product.id);
              const providerName = getProviderDisplayName(product);
              const providerIcon = getProviderIcon(product);
              
              return (
                <div
                  key={product.id}
                  className={styles.productCard}
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className={styles.imageWrapper}>
                    {product.imagen_principal ? (
                      <img
                        src={product.imagen_principal}
                        alt={product.nombre}
                        className={product.estado !== 'activo' ? styles.inactiveImage : ''}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>📦</div>
                    )}
                    {isAuthenticated && user?.rol === 'comprador' && (
                      <button
                        className={`${styles.favoriteButton} ${isFav ? styles.isFavorite : ''}`}
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                        aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                      >
                        ♥
                      </button>
                    )}
                  </div>

                  <div className={styles.productInfo}>
                    {/* Provider Section - Shows empresa name */}
                    <div className={styles.providerSection}>
                      <span className={styles.providerIcon}>{providerIcon}</span>
                      <span className={styles.providerName} title={providerName}>
                        {providerName}
                      </span>
                    </div>

                    <h4 className={styles.productName}>{product.nombre}</h4>
                    <p className={styles.productDesc}>
                      {product.descripcion_corta && product.descripcion_corta.length > 80 
                        ? `${product.descripcion_corta.substring(0, 80)}...` 
                        : product.descripcion_corta}
                    </p>
                    
                    <div className={styles.ratingContainer}>
                      <div className={styles.stars}>
                        {renderStars(product.promedio_valoracion)}
                      </div>
                      <span className={styles.ratingText}>
                        ({product.total_valoraciones || 0})
                      </span>
                    </div>

                    <div className={styles.priceContainer}>
                      {product.precio_oferta && parseFloat(product.precio_oferta) < parseFloat(product.precio) ? (
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;