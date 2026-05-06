import React, { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaImage, FaStar, FaShoppingCart } from 'react-icons/fa';
import Button from '../UI/Button/Button';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, onEdit, onDelete, onView }) => {
    const [imgError, setImgError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    const discount = product.precio_oferta 
        ? Math.round(((product.precio - product.precio_oferta) / product.precio) * 100)
        : 0;
    
    return (
        <div 
            className={`${styles.productCard} ${isHovered ? styles.hovered : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Discount Badge */}
            {discount > 0 && (
                <div className={styles.discountBadge}>
                    -{discount}%
                </div>
            )}
            
            {/* Stock Badge */}
            {product.stock === 0 && (
                <div className={styles.stockBadge}>
                    Agotado
                </div>
            )}
            
            <div className={styles.productImage}>
                {product.imagen_principal && !imgError ? (
                    <>
                        <img 
                            src={product.imagen_principal} 
                            alt={product.nombre}
                            onError={() => setImgError(true)}
                            className={styles.mainImage}
                        />
                        {/* Overlay gradient that appears on hover */}
                        <div className={styles.imageOverlayGradient} />
                        {/* Quick view button */}
                        <button 
                            className={styles.quickViewBtn}
                            onClick={() => onView(product.id)}
                        >
                            Ver rápido
                        </button>
                    </>
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <FaImage size={50} className={styles.placeholderIcon} />
                        <span>Sin imagen</span>
                    </div>
                )}
            </div>
            
            <div className={styles.productInfo}>
                <h3 className={styles.productTitle}>{product.nombre}</h3>
                <p className={styles.productDescription}>
                    {product.descripcion_corta || product.descripcion?.substring(0, 80)}
                    {(product.descripcion_corta?.length > 80 || product.descripcion?.length > 80) && '...'}
                </p>
                
                <div className={styles.productPrice}>
                    {product.precio_oferta ? (
                        <>
                            <span className={styles.currentPrice}>
                                ${parseFloat(product.precio_oferta).toFixed(2)}
                            </span>
                            <span className={styles.oldPrice}>
                                ${parseFloat(product.precio).toFixed(2)}
                            </span>
                        </>
                    ) : (
                        <span className={styles.currentPrice}>
                            ${parseFloat(product.precio).toFixed(2)}
                        </span>
                    )}
                </div>
                
                <div className={styles.productStats}>
                    <div className={styles.visits}>
                        <span className={styles.statIcon}>👁️</span>
                        <span>{product.visitas || 0} visitas</span>
                    </div>
                    <div className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                        <span className={styles.statIcon}>
                            {product.stock > 0 ? '📦' : '❌'}
                        </span>
                        <span>{product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}</span>
                    </div>
                </div>
                
                {/* Progress bar for stock */}
                {product.stock > 0 && product.stock < 50 && (
                    <div className={styles.stockBar}>
                        <div 
                            className={styles.stockBarFill} 
                            style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                        />
                        <span className={styles.stockBarText}>¡Últimas unidades!</span>
                    </div>
                )}
                
                <div className={styles.productActions}>
                    <Button 
                        size="small" 
                        variant="outline" 
                        onClick={() => onEdit(product)}
                        className={styles.actionBtn}
                    >
                        <FaEdit /> Editar
                    </Button>
                    <Button 
                        size="small" 
                        variant="danger" 
                        onClick={() => onDelete(product.id)}
                        className={styles.actionBtn}
                    >
                        <FaTrash /> Eliminar
                    </Button>
                    <Button 
                        size="small" 
                        variant="secondary" 
                        onClick={() => onView(product.id)}
                        className={styles.actionBtn}
                    >
                        <FaEye /> Ver
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;