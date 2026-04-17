import React, { useState, useMemo } from 'react';
import { FaSearch, FaStore, FaMapMarkerAlt, FaFire, FaChartLine, FaFilter, FaTimes } from 'react-icons/fa';
import styles from './PopularCategories.module.css';

const PopularCategories = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    sortBy: 'mostSearched' // mostSearched, name, nameDesc, products
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Sample categories data
  const categories = [
    {
      id: 1,
      name: 'Tecnología',
      icon: '💻',
      description: 'Equipos, software, servicios IT y soluciones tecnológicas',
      products: 245,
      searches: 1250,
      locations: ['Managua', 'León', 'Granada'],
      color: '#1A73E8'
    },
    {
      id: 2,
      name: 'Construcción',
      icon: '🏗️',
      description: 'Materiales, herramientas, equipos y servicios de construcción',
      products: 189,
      searches: 980,
      locations: ['Managua', 'Matagalpa', 'Estelí'],
      color: '#F57C00'
    },
    {
      id: 3,
      name: 'Alimentos',
      icon: '🍔',
      description: 'Insumos alimenticios, bebidas, productos gourmet y distribución',
      products: 312,
      searches: 2100,
      locations: ['Managua', 'León', 'Masaya'],
      color: '#2E7D32'
    },
    {
      id: 4,
      name: 'Textiles',
      icon: '👕',
      description: 'Telas, confección, uniformes y productos textiles industriales',
      products: 134,
      searches: 560,
      locations: ['Managua', 'Granada', 'Carazo'],
      color: '#7B1FA2'
    },
    {
      id: 5,
      name: 'Químicos',
      icon: '🧪',
      description: 'Productos químicos industriales, laboratorios y suministros',
      products: 98,
      searches: 430,
      locations: ['Managua', 'León', 'Chinandega'],
      color: '#1E88E5'
    },
    {
      id: 6,
      name: 'Transporte',
      icon: '🚚',
      description: 'Logística, transporte de carga, vehículos y repuestos',
      products: 167,
      searches: 890,
      locations: ['Managua', 'Rivas', 'Nueva Segovia'],
      color: '#388E3C'
    },
    {
      id: 7,
      name: 'Salud',
      icon: '🏥',
      description: 'Equipos médicos, insumos hospitalarios y farmacéuticos',
      products: 145,
      searches: 720,
      locations: ['Managua', 'León', 'Matagalpa'],
      color: '#D32F2F'
    },
    {
      id: 8,
      name: 'Agricultura',
      icon: '🌾',
      description: 'Insumos agrícolas, maquinaria y tecnología agropecuaria',
      products: 156,
      searches: 680,
      locations: ['Matagalpa', 'Jinotega', 'Estelí'],
      color: '#66BB6A'
    },
    {
      id: 9,
      name: 'Energía',
      icon: '⚡',
      description: 'Soluciones energéticas, paneles solares y generadores',
      products: 89,
      searches: 450,
      locations: ['Managua', 'León', 'Granada'],
      color: '#FFC107'
    },
    {
      id: 10,
      name: 'Muebles',
      icon: '🪑',
      description: 'Muebles de oficina, equipamiento comercial y decoración',
      products: 123,
      searches: 590,
      locations: ['Managua', 'Masaya', 'Carazo'],
      color: '#AB47BC'
    }
  ];

  // Get unique locations from categories
  const allLocations = useMemo(() => {
    const locations = new Set();
    categories.forEach(cat => {
      cat.locations.forEach(loc => locations.add(loc));
    });
    return Array.from(locations).sort();
  }, []);

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        cat.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(cat =>
        cat.locations.includes(filters.location)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'mostSearched':
        filtered.sort((a, b) => b.searches - a.searches);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'products':
        filtered.sort((a, b) => b.products - a.products);
        break;
      default:
        break;
    }

    return filtered;
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      location: '',
      sortBy: 'mostSearched'
    });
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.location) count++;
    if (filters.sortBy !== 'mostSearched') count++;
    return count;
  };

  const handleCategoryClick = (category) => {
    console.log('Selected category:', category);
    // Navigate to category products page
    // navigate(`/categories/${category.id}`);
  };

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Categorías Populares
          </h2>
          <p className={styles.sectionSubtitle}>
            Explora las categorías más buscadas por las empresas en Nicaragua
          </p>
        </div>

        {/* Filters Bar */}
        <div className={styles.filtersBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FaSearch style={{ marginRight: '4px' }} /> Buscar Categoría
            </label>
            <div className={styles.searchInputWrapper}>
              <FaSearch className={styles.searchIcon} size={14} />
              <input
                type="text"
                placeholder="Ej: Tecnología, Alimentos..."
                className={styles.filterInput}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FaMapMarkerAlt style={{ marginRight: '4px' }} /> Ubicación
            </label>
            <select
              className={styles.filterSelect}
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">Todas las ubicaciones</option>
              {allLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FaChartLine style={{ marginRight: '4px' }} /> Ordenar por
            </label>
            <select
              className={styles.filterSelect}
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="mostSearched">Más Buscadas</option>
              <option value="name">Nombre (A-Z)</option>
              <option value="nameDesc">Nombre (Z-A)</option>
              <option value="products">Más Productos</option>
            </select>
          </div>

          <button className={styles.resetButton} onClick={handleResetFilters}>
            <FaFilter /> Limpiar Filtros
            {getActiveFiltersCount() > 0 && ` (${getActiveFiltersCount()})`}
          </button>
        </div>

        {/* Active Filters Tags */}
        {(filters.search || filters.location || filters.sortBy !== 'mostSearched') && (
          <div className={styles.activeFilters}>
            {filters.search && (
              <div className={styles.filterTag}>
                Búsqueda: {filters.search}
                <span className={styles.removeFilter} onClick={() => handleFilterChange('search', '')}>
                  <FaTimes size={12} />
                </span>
              </div>
            )}
            {filters.location && (
              <div className={styles.filterTag}>
                Ubicación: {filters.location}
                <span className={styles.removeFilter} onClick={() => handleFilterChange('location', '')}>
                  <FaTimes size={12} />
                </span>
              </div>
            )}
            {filters.sortBy !== 'mostSearched' && (
              <div className={styles.filterTag}>
                Orden: {filters.sortBy === 'name' ? 'A-Z' : filters.sortBy === 'nameDesc' ? 'Z-A' : 'Más Productos'}
                <span className={styles.removeFilter} onClick={() => handleFilterChange('sortBy', 'mostSearched')}>
                  <FaTimes size={12} />
                </span>
              </div>
            )}
          </div>
        )}

        {/* Categories Grid */}
        {paginatedCategories.length > 0 ? (
          <>
            <div className={styles.categoriesGrid}>
              {paginatedCategories.map((category) => (
                <div
                  key={category.id}
                  className={styles.categoryCard}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.searches > 1000 && (
                    <div className={styles.mostSearchedBadge}>
                      <FaFire size={10} /> Más Buscada
                    </div>
                  )}

                  <div className={styles.categoryIcon} style={{ background: `linear-gradient(135deg, ${category.color}20, ${category.color}40)` }}>
                    {category.icon}
                  </div>

                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <p className={styles.categoryDescription}>{category.description}</p>

                  <div className={styles.categoryStats}>
                    <div className={styles.stat}>
                      <FaStore size={12} />
                      <span className={styles.statValue}>{category.products}</span>
                      <span>productos</span>
                    </div>
                    <div className={styles.stat}>
                      <FaFire size={12} />
                      <span className={styles.statValue}>{category.searches}</span>
                      <span>búsquedas</span>
                    </div>
                  </div>

                  <div className={styles.locationTags}>
                    {category.locations.slice(0, 3).map(location => (
                      <span key={location} className={styles.locationTag}>
                        📍 {location}
                      </span>
                    ))}
                  </div>

                  <button className={styles.exploreButton}>
                    Explorar Categoría →
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3 className={styles.noResultsTitle}>No se encontraron categorías</h3>
            <p className={styles.noResultsText}>
              Intenta con otros filtros o términos de búsqueda
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularCategories;