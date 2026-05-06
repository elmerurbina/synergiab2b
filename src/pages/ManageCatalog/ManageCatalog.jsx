import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaImage, FaTag, FaBox, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';
import { productAPI, categoryAPI } from '../../services/api';
import styles from './ManageCatalog.module.css';

const ManageCatalog = () => {
    console.log('🚀 ManageCatalog component mounted/rendered');
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        descripcion_corta: '',
        precio: '',
        precio_oferta: '',
        stock: '',
        unidad_medida: 'unidad',
        categoria: '',
        ubicacion: '',
        etiquetas: ''
    });

    useEffect(() => {
        console.log('📝 ManageCatalog useEffect - Component mounted');
        fetchProducts();
        fetchCategories();
        
        // Debug: Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('👤 Current user from localStorage:', user);
        
        return () => {
            console.log('🧹 ManageCatalog component unmounting');
        };
    }, []);

    const fetchProducts = async () => {
        console.log('📦 Fetching products...');
        try {
            setLoading(true);
            console.log('Calling productAPI.getMyProducts()');
            const response = await productAPI.getMyProducts();
            console.log('✅ Products response received:', response);
            console.log('Products data:', response.data);
            const productsData = response.data.results || response.data || [];
            setProducts(productsData);
            console.log(`📊 Loaded ${productsData.length} products`);
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data
            });
            setError(error.message);
            if (error.response?.status === 401) {
                toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
            } else {
                toast.error('Error al cargar los productos');
            }
        } finally {
            setLoading(false);
            console.log('🏁 Fetch products completed, loading set to false');
        }
    };

    const fetchCategories = async () => {
        console.log('📁 Fetching categories...');
        try {
            console.log('Calling categoryAPI.getCategories()');
            const response = await categoryAPI.getCategories();
            console.log('✅ Categories response received:', response);
            const categoriesData = response.data.results || response.data || [];
            setCategories(categoriesData);
            console.log(`📊 Loaded ${categoriesData.length} categories`);
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`📝 Input changed: ${name} = ${value}`);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('📤 Submitting product form...');
        console.log('Form data:', formData);
        console.log('Editing product:', editingProduct);
        
        setLoading(true);
        
        const productData = {
            ...formData,
            precio: parseFloat(formData.precio),
            precio_oferta: formData.precio_oferta ? parseFloat(formData.precio_oferta) : null,
            stock: parseInt(formData.stock) || 0,
            etiquetas: formData.etiquetas ? formData.etiquetas.split(',').map(tag => tag.trim()) : []
        };
        
        console.log('Processed product data:', productData);
        
        try {
            if (editingProduct) {
                console.log(`🔄 Updating product ${editingProduct.id}`);
                const response = await productAPI.updateProduct(editingProduct.id, productData);
                console.log('Update response:', response);
                toast.success('Producto actualizado exitosamente');
            } else {
                console.log('➕ Creating new product');
                const response = await productAPI.createProduct(productData);
                console.log('Create response:', response);
                toast.success('Producto creado exitosamente');
            }
            await fetchProducts();
            handleCloseModal();
        } catch (error) {
            console.error('❌ Error saving product:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(error.response?.data?.message || 'Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        console.log('✏️ Editing product:', product);
        setEditingProduct(product);
        const newFormData = {
            nombre: product.nombre,
            descripcion: product.descripcion || '',
            descripcion_corta: product.descripcion_corta || '',
            precio: product.precio,
            precio_oferta: product.precio_oferta || '',
            stock: product.stock,
            unidad_medida: product.unidad_medida,
            categoria: product.categoria,
            ubicacion: product.ubicacion || '',
            etiquetas: product.etiquetas?.map(e => e.nombre).join(', ') || ''
        };
        console.log('Form data set to:', newFormData);
        setFormData(newFormData);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        console.log(`🗑️ Attempting to delete product ${id}`);
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                console.log(`Deleting product ${id}`);
                await productAPI.deleteProduct(id);
                console.log('✅ Product deleted successfully');
                toast.success('Producto eliminado exitosamente');
                await fetchProducts();
            } catch (error) {
                console.error('❌ Error deleting product:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response,
                    status: error.response?.status
                });
                toast.error('Error al eliminar el producto');
            }
        } else {
            console.log('❌ Deletion cancelled by user');
        }
    };

    const handleCloseModal = () => {
        console.log('🔒 Closing modal');
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
            nombre: '',
            descripcion: '',
            descripcion_corta: '',
            precio: '',
            precio_oferta: '',
            stock: '',
            unidad_medida: 'unidad',
            categoria: '',
            ubicacion: '',
            etiquetas: ''
        });
    };

    // Error boundary
    if (error) {
        console.error('⚠️ Component error state:', error);
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Error al cargar el catálogo</h2>
                <p>{error}</p>
                <button 
                    onClick={() => {
                        console.log('🔄 Retrying...');
                        setError(null);
                        fetchProducts();
                    }}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#1A73E8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (loading && products.length === 0) {
        console.log('⏳ Loading state - showing spinner');
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} />
                <p>Cargando tus productos...</p>
            </div>
        );
    }

    console.log('🎨 Rendering main component with', products.length, 'products');
    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Manejar Catálogos</h1>
                    <p>Gestiona tus productos y servicios</p>
                </div>
                <Button variant="primary" onClick={() => {
                    console.log('➕ New product button clicked');
                    setShowModal(true);
                }}>
                    <FaPlus /> Nuevo Producto
                </Button>
            </div>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <FaBox className={styles.statIcon} />
                    <div className={styles.statInfo}>
                        <h3>Total Productos</h3>
                        <p>{products.length}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <FaTag className={styles.statIcon} />
                    <div className={styles.statInfo}>
                        <h3>Categorías Disponibles</h3>
                        <p>{categories.length}</p>
                    </div>
                </div>
            </div>

            {products.length === 0 ? (
                <div className={styles.emptyState}>
                    <FaBox size={60} />
                    <h3>No tienes productos aún</h3>
                    <p>Comienza agregando tu primer producto al catálogo</p>
                    <Button variant="primary" onClick={() => {
                        console.log('➕ Add product button clicked from empty state');
                        setShowModal(true);
                    }}>
                        <FaPlus /> Agregar Producto
                    </Button>
                </div>
            ) : (
                <div className={styles.productsGrid}>
                    {products.map(product => (
                        <div key={product.id} className={styles.productCard}>
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
                                <p className={styles.productDescription}>{product.descripcion_corta || product.descripcion?.substring(0, 100)}</p>
                                <div className={styles.productPrice}>
                                    <span className={styles.price}>${parseFloat(product.precio_actual || product.precio).toFixed(2)}</span>
                                    {product.precio_oferta && (
                                        <span className={styles.oldPrice}>${parseFloat(product.precio).toFixed(2)}</span>
                                    )}
                                </div>
                                <div className={styles.productStats}>
                                    <span>👁️ {product.visitas || 0} vistas</span>
                                    <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                                        {product.stock > 0 ? `📦 ${product.stock} disponibles` : '❌ Sin stock'}
                                    </span>
                                </div>
                                <div className={styles.productActions}>
                                    <Button size="small" variant="outline" onClick={() => handleEdit(product)}>
                                        <FaEdit /> Editar
                                    </Button>
                                    <Button size="small" variant="danger" onClick={() => handleDelete(product.id)}>
                                        <FaTrash /> Eliminar
                                    </Button>
                                    <Button size="small" variant="secondary" onClick={() => window.open(`/productos/${product.id}`, '_blank')}>
                                        <FaEye /> Ver
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Create/Edit Product */}
            {showModal && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <Input
                                    label="Nombre del Producto"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Input
                                    label="Descripción Corta"
                                    name="descripcion_corta"
                                    value={formData.descripcion_corta}
                                    onChange={handleInputChange}
                                    placeholder="Breve descripción del producto"
                                />
                                <div className={styles.priceRow}>
                                    <Input
                                        label="Precio"
                                        name="precio"
                                        type="number"
                                        step="0.01"
                                        value={formData.precio}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Input
                                        label="Precio de Oferta"
                                        name="precio_oferta"
                                        type="number"
                                        step="0.01"
                                        value={formData.precio_oferta}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className={styles.priceRow}>
                                    <Input
                                        label="Stock"
                                        name="stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                    />
                                    <select
                                        name="unidad_medida"
                                        value={formData.unidad_medida}
                                        onChange={handleInputChange}
                                        className={styles.select}
                                    >
                                        <option value="unidad">Unidad</option>
                                        <option value="kg">Kilogramo</option>
                                        <option value="litro">Litro</option>
                                        <option value="metro">Metro</option>
                                        <option value="docena">Docena</option>
                                    </select>
                                </div>
                                <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleInputChange}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">Seleccionar Categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    className={styles.textarea}
                                    rows="4"
                                    placeholder="Descripción detallada del producto..."
                                />
                                <Input
                                    label="Etiquetas (separadas por coma)"
                                    name="etiquetas"
                                    value={formData.etiquetas}
                                    onChange={handleInputChange}
                                    placeholder="ej: tecnología, innovación, software"
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <Button type="button" variant="outline" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" loading={loading}>
                                    <FaSave /> {editingProduct ? 'Actualizar' : 'Guardar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCatalog;