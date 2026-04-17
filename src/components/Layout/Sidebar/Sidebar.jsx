import React, { useState } from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen = false, onClose }) => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Mis Productos', icon: '📦' },
    { id: 'orders', label: 'Consultas', icon: '💬' },
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ];

  const categories = [
    { name: 'Tecnología', count: 45 },
    { name: 'Construcción', count: 32 },
    { name: 'Alimentos', count: 28 },
    { name: 'Textiles', count: 19 },
    { name: 'Químicos', count: 15 },
  ];

  const locations = [
    'Managua',
    'León',
    'Granada',
    'Matagalpa',
    'Estelí',
  ];

  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          {/* Main Navigation */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Menú Principal</h3>
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.navItem} ${activeItem === item.id ? styles.activeNavItem : ''}`}
                onClick={() => setActiveItem(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Filters Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Filtros</h3>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Precio</label>
              <select className={styles.filterSelect}>
                <option>Todos los precios</option>
                <option>Menos de $500</option>
                <option>$500 - $1000</option>
                <option>$1000 - $5000</option>
                <option>Más de $5000</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ubicación</label>
              <select className={styles.filterSelect}>
                <option>Todas las ubicaciones</option>
                {locations.map((loc) => (
                  <option key={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Categorías</h3>
            <div className={styles.categoryList}>
              {categories.map((category) => (
                <label key={category.name} className={styles.categoryItem}>
                  <input type="checkbox" className={styles.categoryCheckbox} />
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryCount}>({category.count})</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {isOpen && <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose} />}

      <button className={styles.toggleButton} onClick={onClose}>
        {isOpen ? '✕' : '☰'}
      </button>
    </>
  );
};

export default Sidebar;