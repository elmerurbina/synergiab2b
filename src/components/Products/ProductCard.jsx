import React from 'react';
import { FaEdit, FaTrash, FaEye, FaImage } from 'react-icons/fa';
import Button from '../UI/Button/Button';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, onEdit, onDelete, onView }) => {
    return (
        <div className={styles.productCard}>
            <div className={styles.productImage}>
                {product.imagen_principal ? (
                    <img src={product.imagen_principal} alt={product.nombre} />
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <FaImage size={40} />
                    </div>
                )}
            </div>
            <div className={styles.productInfo}>
                <h3>{product.nombre}</h3>
                <p className={styles.productDescription}>
                    {product.descripcion_corta || product.descripcion?.substring(0, 100)}
                </p>
                <div className={styles.productPrice}>
                    <span className={styles.price}>
                        ${parseFloat(product.precio_actual || product.precio).toFixed(2)}
                    </span>
                    {product.precio_oferta && (
                        <span className={styles.oldPrice}>
                            ${parseFloat(product.precio).toFixed(2)}
                        </span>
                    )}
                </div>
                <div className={styles.productStats}>
                    <span>👁️ {product.visitas || 0} visitas</span>
                    <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                        {product.stock > 0 ? `📦 ${product.stock} disponibles` : '❌ Sin stock'}
                    </span>
                </div>
                <div className={styles.productActions}>
                    <Button size="small" variant="outline" onClick={() => onEdit(product)}>
                        <FaEdit /> Editar
                    </Button>
                    <Button size="small" variant="danger" onClick={() => onDelete(product.id)}>
                        <FaTrash /> Eliminar
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => onView(product.id)}>
                        <FaEye /> Ver
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;