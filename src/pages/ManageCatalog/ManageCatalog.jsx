import React, { useState, useEffect } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Button from '../../components/UI/Button/Button';
import ProductCard from '../../components/Products/ProductCard';
import ProductFormModal from '../../components/Products/ProductFormModal';
import { productAPI, categoryAPI } from '../../services/api';
import styles from './ManageCatalog.module.css';

const ManageCatalog = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getMyProducts();
            const productsData = response.data.results || response.data || [];
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.message);
            toast.error('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getCategories();
            const categoriesData = response.data.results || response.data || [];
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error al cargar las categorías');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        
        try {
            await productAPI.deleteProduct(id);
            toast.success('¡Producto eliminado exitosamente!');
            await fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error al eliminar el producto');
        }
    };

    const handleView = (id) => {
        window.open(`/productos/${id}`, '_blank');
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleSuccess = () => {
        fetchProducts();
        fetchCategories();
    };

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error al cargar el catálogo</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className={styles.retryBtn}>
                    Reintentar
                </button>
            </div>
        );
    }

    if (loading && products.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} />
                <p>Cargando tus productos...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Manejar Catálogos</h1>
                    <p>Gestiona tus productos y servicios</p>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <FaPlus /> Nuevo Producto
                </Button>
            </div>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <h3>Total Productos</h3>
                    <p>{products.length}</p>
                </div>
                <div className={styles.statCard}>
                    <h3>Categorías Disponibles</h3>
                    <p>{categories.length}</p>
                </div>
            </div>

            {products.length === 0 ? (
                <div className={styles.emptyState}>
                    <h3>No tienes productos aún</h3>
                    <p>Comienza agregando tu primer producto al catálogo</p>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        <FaPlus /> Agregar Producto
                    </Button>
                </div>
            ) : (
                <div className={styles.productsGrid}>
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                        />
                    ))}
                </div>
            )}

            <ProductFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                product={editingProduct}
                onSuccess={handleSuccess}
                categories={categories}
            />
        </div>
    );
};

export default ManageCatalog;