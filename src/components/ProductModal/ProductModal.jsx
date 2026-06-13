import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes, FaStar, FaEye, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { interactionAPI } from '../../services/api';
import styles from './ProductModal.module.css';

const ProductModal = ({ isOpen, onClose, product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      // Register view interaction when modal opens
      registerView();
      setCurrentImageIndex(0);
    }
  }, [isOpen, product]);

  const registerView = async () => {
    try {
      await interactionAPI.registerInteraction(product.id, 'vista');
    } catch (error) {
      console.error('Error registering view:', error);
    }
  };

  const handleWhatsAppClick = async () => {
    try {
      // Register WhatsApp click interaction
      await interactionAPI.registerInteraction(product.id, 'click_whatsapp');
    } catch (error) {
      console.error('Error registering click:', error);
    }

    // Get product and provider info
    const productName = product.nombre;
    const productPrice = product.precio_oferta && product.precio_oferta < product.precio 
      ? product.precio_oferta 
      : product.precio;
    const providerName = product.proveedor_empresa || product.proveedor_nombre || 'Proveedor';
    const providerPhone = product.proveedor_telefono || product.proveedor_info?.telefono || '';
    
    // Create the message
    const message = `Hola *${providerName}*,

Me interesa el producto *${productName}* que vi en SinergiaB2B.

💰 *Precio:* C$${parseFloat(productPrice).toFixed(2)}
🔗 *Enlace:* ${window.location.origin}/producto/${product.id}

¿Podría darme más información sobre disponibilidad y formas de pago?

¡Gracias!`;

    // Open WhatsApp
    const cleanPhone = providerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      alert('El proveedor no tiene número de WhatsApp registrado');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.nombre,
      text: `Mira este producto en SinergiaB2B: ${product.nombre}`,
      url: `${window.location.origin}/producto/${product.id}`,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const nextImage = () => {
    if (product.imagenes && product.imagenes.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.imagenes.length);
    }
  };

  const prevImage = () => {
    if (product.imagenes && product.imagenes.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.imagenes.length) % product.imagenes.length);
    }
  };

  if (!isOpen || !product) return null;

  const images = product.imagenes || [];
  const currentImage = images[currentImageIndex]?.url_absoluta || images[currentImageIndex]?.url || product.imagen_principal;
  const hasMultipleImages = images.length > 1;
  const averageRating = product.promedio_valoracion || 0;
  const totalRatings = product.total_valoraciones || 0;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>

        <div className={styles.modalContent}>
          {/* Image Gallery */}
          <div className={styles.imageGallery}>
            <div className={styles.mainImage}>
              {currentImage ? (
                <img src={currentImage} alt={product.nombre} />
              ) : (
                <div className={styles.imagePlaceholder}>📦</div>
              )}
              
              {hasMultipleImages && (
                <>
                  <button className={styles.navButtonPrev} onClick={prevImage}>
                    <FaChevronLeft />
                  </button>
                  <button className={styles.navButtonNext} onClick={nextImage}>
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className={styles.thumbnailStrip}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`${styles.thumbnail} ${currentImageIndex === idx ? styles.activeThumbnail : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img src={img.url_absoluta || img.url} alt={`Thumbnail ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <div className={styles.providerInfo}>
              <span className={styles.providerIcon}>🏪</span>
              <span className={styles.providerName}>
                {product.proveedor_empresa || product.proveedor_nombre || 'Proveedor'}
              </span>
            </div>

            <h2 className={styles.productTitle}>{product.nombre}</h2>
            
            <div className={styles.ratingContainer}>
              <div className={styles.stars}>
                {'★'.repeat(Math.floor(averageRating))}
                {'☆'.repeat(5 - Math.floor(averageRating))}
              </div>
              <span className={styles.ratingText}>
                {averageRating.toFixed(1)} ({totalRatings} valoraciones)
              </span>
              <span className={styles.viewsCount}>
                <FaEye /> {product.visitas || 0} vistas
              </span>
            </div>

            <div className={styles.priceContainer}>
              {product.precio_oferta && product.precio_oferta < product.precio ? (
                <>
                  <span className={styles.oldPrice}>C$ {parseFloat(product.precio).toFixed(2)}</span>
                  <span className={styles.currentPrice}>C$ {parseFloat(product.precio_oferta).toFixed(2)}</span>
                  <span className={styles.discountBadge}>
                    {Math.round(((product.precio - product.precio_oferta) / product.precio) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className={styles.currentPrice}>C$ {parseFloat(product.precio).toFixed(2)}</span>
              )}
            </div>

            <div className={styles.productDescription}>
              <h4>Descripción del producto</h4>
              <p>{product.descripcion || product.descripcion_corta}</p>
            </div>

            <div className={styles.productMeta}>
              {product.stock !== undefined && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Stock disponible:</span>
                  <span className={`${styles.metaValue} ${product.stock > 0 ? styles.inStock : styles.outStock}`}>
                    {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                  </span>
                </div>
              )}
              
              {product.unidad_medida && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Unidad de medida:</span>
                  <span className={styles.metaValue}>{product.unidad_medida}</span>
                </div>
              )}
              
              {product.categoria_info?.nombre && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Categoría:</span>
                  <span className={styles.metaValue}>{product.categoria_info.nombre}</span>
                </div>
              )}
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.whatsappButton} onClick={handleWhatsAppClick}>
                <FaWhatsapp /> Consultar por WhatsApp
              </button>
              <button className={styles.shareButton} onClick={handleShare}>
                📤 Compartir
              </button>
            </div>

            <div className={styles.contactNote}>
              <p>⚠️ Al hacer clic en WhatsApp, serás redirigido a conversación directa con el proveedor.</p>
              <p className={styles.noteSmall}>SinergiaB2B solo conecta compradores con proveedores verificados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;