import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaImage, FaTag, FaBox, FaSave, FaTimes, FaSpinner, FaFolderPlus, FaUpload, FaTrashAlt } from 'react-icons/fa';
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
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [categorySubmitting, setCategorySubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [newImages, setNewImages] = useState([]); // Store File objects
    const [existingImages, setExistingImages] = useState([]);
    
    const [newCategory, setNewCategory] = useState({
        nombre: '',
        descripcion: ''
    });
    
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
        
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('👤 Current user from localStorage:', user);
        
        return () => {
            console.log('🧹 ManageCatalog component unmounting');
            // Cleanup object URLs
            newImages.forEach(image => {
                if (image.preview) {
                    URL.revokeObjectURL(image.preview);
                }
            });
        };
    }, []);

    const fetchProducts = async () => {
        console.log('📦 Fetching products...');
        try {
            setLoading(true);
            const response = await productAPI.getMyProducts();
            console.log('✅ Products response received:', response);
            const productsData = response.data.results || response.data || [];
            setProducts(productsData);
            console.log(`📊 Loaded ${productsData.length} products`);
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            setError(error.message);
            if (error.response?.status === 401) {
                toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
            } else {
                toast.error('Error al cargar los productos');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        console.log('📁 Fetching categories...');
        try {
            const response = await categoryAPI.getCategories();
            console.log('✅ Categories response received:', response);
            const categoriesData = response.data.results || response.data || [];
            setCategories(categoriesData);
            console.log(`📊 Loaded ${categoriesData.length} categories`);
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            toast.error('Error al cargar las categorías');
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.nombre.trim()) {
            errors.nombre = 'El nombre del producto es requerido';
        } else if (formData.nombre.length < 3) {
            errors.nombre = 'El nombre debe tener al menos 3 caracteres';
        } else if (formData.nombre.length > 100) {
            errors.nombre = 'El nombre debe tener menos de 100 caracteres';
        }
        
        if (!formData.precio) {
            errors.precio = 'El precio es requerido';
        } else if (parseFloat(formData.precio) <= 0) {
            errors.precio = 'El precio debe ser mayor a 0';
        }
        
        if (formData.precio_oferta && parseFloat(formData.precio_oferta) >= parseFloat(formData.precio)) {
            errors.precio_oferta = 'El precio de oferta debe ser menor al precio regular';
        }
        
        if (formData.stock && parseInt(formData.stock) < 0) {
            errors.stock = 'El stock no puede ser negativo';
        }
        
        if (!formData.categoria) {
            errors.categoria = 'Por favor selecciona una categoría';
        }
        
        if (formData.descripcion_corta && formData.descripcion_corta.length > 200) {
            errors.descripcion_corta = 'La descripción corta debe tener menos de 200 caracteres';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateCategoryForm = () => {
        const errors = {};
        
        if (!newCategory.nombre.trim()) {
            errors.nombre = 'El nombre de la categoría es requerido';
        } else if (newCategory.nombre.length < 2) {
            errors.nombre = 'El nombre debe tener al menos 2 caracteres';
        } else if (newCategory.nombre.length > 50) {
            errors.nombre = 'El nombre debe tener menos de 50 caracteres';
        }
        
        const categoryExists = categories.some(
            cat => cat.nombre.toLowerCase() === newCategory.nombre.toLowerCase()
        );
        if (categoryExists) {
            errors.nombre = 'Ya existe una categoría con este nombre';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`📝 Input changed: ${name} = ${value}`);
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCategoryInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // Store files with preview URLs
        const newImageObjects = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
            uploading: false
        }));
        
        setNewImages(prev => [...prev, ...newImageObjects]);
        
        // If editing an existing product, upload immediately
        if (editingProduct?.id) {
            for (const imageObj of newImageObjects) {
                const formDataImg = new FormData();
                formDataImg.append('url', imageObj.file);
                formDataImg.append('producto', editingProduct.id);
                
                try {
                    const response = await productAPI.uploadImage(formDataImg);
                    console.log('✅ Image uploaded:', response.data);
                    toast.success('Imagen subida exitosamente');
                    // Refresh existing images
                    const productResponse = await productAPI.getProduct(editingProduct.id);
                    setExistingImages(productResponse.data.imagenes || []);
                } catch (error) {
                    console.error('❌ Error uploading image:', error);
                    toast.error('Error al subir la imagen');
                }
            }
            // Remove from new images since they're uploaded
            setNewImages([]);
        }
        
        e.target.value = '';
    };

    const handleDeleteNewImage = (index) => {
        const imageToDelete = newImages[index];
        if (imageToDelete.preview) {
            URL.revokeObjectURL(imageToDelete.preview);
        }
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) return;
        
        try {
            await productAPI.deleteImage(imageId);
            toast.success('Imagen eliminada exitosamente');
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch (error) {
            console.error('❌ Error deleting image:', error);
            toast.error('Error al eliminar la imagen');
        }
    };

    const handleSetMainImage = async (imageId) => {
        try {
            await productAPI.setMainImage(imageId);
            toast.success('Imagen principal actualizada');
            // Refresh images list
            if (editingProduct?.id) {
                const response = await productAPI.getProduct(editingProduct.id);
                setExistingImages(response.data.imagenes || []);
            }
        } catch (error) {
            console.error('❌ Error setting main image:', error);
            toast.error('Error al establecer imagen principal');
        }
    };

    const handleCreateCategory = async () => {
        if (!validateCategoryForm()) {
            return;
        }
        
        setCategorySubmitting(true);
        try {
            console.log('➕ Creating new category:', newCategory);
            const response = await categoryAPI.createCategory(newCategory);
            console.log('✅ Category created:', response.data);
            
            toast.success('¡Categoría creada exitosamente!');
            
            await fetchCategories();
            
            if (response.data && response.data.id) {
                setFormData(prev => ({ ...prev, categoria: response.data.id }));
            }
            
            setShowCategoryModal(false);
            setNewCategory({ nombre: '', descripcion: '' });
            setFormErrors({});
            
        } catch (error) {
            console.error('❌ Error creating category:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al crear la categoría';
            toast.error(errorMsg);
            
            if (error.response?.data) {
                setFormErrors(error.response.data);
            }
        } finally {
            setCategorySubmitting(false);
        }
    };

    const uploadNewImages = async (productId) => {
        for (const imageObj of newImages) {
            const formDataImg = new FormData();
            formDataImg.append('url', imageObj.file);
            formDataImg.append('producto', productId);
            
            try {
                await productAPI.uploadImage(formDataImg);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }
        
        console.log('📤 Submitting product form...');
        console.log('Form data:', formData);
        
        setSubmitting(true);
        
        const productData = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            descripcion_corta: formData.descripcion_corta,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock) || 0,
            unidad_medida: formData.unidad_medida,
            categoria: parseInt(formData.categoria),
            etiquetas: formData.etiquetas ? formData.etiquetas.split(',').map(tag => tag.trim()) : []
        };
        
        if (formData.precio_oferta && formData.precio_oferta !== '') {
            productData.precio_oferta = parseFloat(formData.precio_oferta);
        }
        
        if (formData.ubicacion && formData.ubicacion !== '') {
            productData.ubicacion = parseInt(formData.ubicacion);
        }
        
        console.log('Processed product data for backend:', productData);
        
        try {
            let response;
            if (editingProduct) {
                console.log(`🔄 Updating product ${editingProduct.id}`);
                response = await productAPI.updateProduct(editingProduct.id, productData);
                toast.success('¡Producto actualizado exitosamente!');
                
                // Upload any new images
                if (newImages.length > 0) {
                    await uploadNewImages(editingProduct.id);
                    setNewImages([]);
                }
            } else {
                console.log('➕ Creating new product');
                response = await productAPI.createProduct(productData);
                toast.success('¡Producto creado exitosamente!');
                
                // Upload images for new product
                if (newImages.length > 0 && response.data?.id) {
                    await uploadNewImages(response.data.id);
                    setNewImages([]);
                }
            }
            
            await fetchProducts();
            handleCloseModal();
        } catch (error) {
            console.error('❌ Error saving product:', error);
            console.error('Error response data:', error.response?.data);
            
            if (error.response?.data) {
                const backendErrors = error.response.data;
                let errorMessage = '';
                
                if (typeof backendErrors === 'object') {
                    errorMessage = Object.values(backendErrors).flat().join(', ');
                } else if (typeof backendErrors === 'string') {
                    errorMessage = backendErrors;
                } else {
                    errorMessage = 'Error al guardar el producto';
                }
                
                toast.error(errorMessage);
                setFormErrors(backendErrors);
            } else {
                toast.error('Error al guardar el producto');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (product) => {
        console.log('✏️ Editing product:', product);
        setEditingProduct(product);
        setFormData({
            nombre: product.nombre,
            descripcion: product.descripcion || '',
            descripcion_corta: product.descripcion_corta || '',
            precio: product.precio,
            precio_oferta: product.precio_oferta || '',
            stock: product.stock,
            unidad_medida: product.unidad_medida || 'unidad',
            categoria: product.categoria?.id || product.categoria || '',
            ubicacion: product.ubicacion?.id || '',
            etiquetas: product.etiquetas?.map(e => e.nombre).join(', ') || ''
        });
        
        // Load existing images
        if (product.id) {
            try {
                const response = await productAPI.getProduct(product.id);
                setExistingImages(response.data.imagenes || []);
            } catch (error) {
                console.error('Error loading product images:', error);
            }
        }
        
        setNewImages([]);
        setFormErrors({});
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        console.log(`🗑️ Attempting to delete product ${id}`);
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                console.log(`Deleting product ${id}`);
                await productAPI.deleteProduct(id);
                toast.success('¡Producto eliminado exitosamente!');
                await fetchProducts();
            } catch (error) {
                console.error('❌ Error deleting product:', error);
                toast.error('Error al eliminar el producto');
            }
        }
    };

    const handleCloseModal = () => {
        console.log('🔒 Closing modal');
        // Cleanup preview URLs
        newImages.forEach(image => {
            if (image.preview) {
                URL.revokeObjectURL(image.preview);
            }
        });
        setShowModal(false);
        setEditingProduct(null);
        setFormErrors({});
        setNewImages([]);
        setExistingImages([]);
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

    const handleCloseCategoryModal = () => {
        setShowCategoryModal(false);
        setNewCategory({ nombre: '', descripcion: '' });
        setFormErrors({});
    };

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Error al cargar el catálogo</h2>
                <p>{error}</p>
                <button 
                    onClick={() => {
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
                    <Button variant="primary" onClick={() => setShowModal(true)}>
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
                                <div className={styles.formGroup}>
                                    <Input
                                        label="Nombre del Producto"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        error={formErrors.nombre}
                                        required
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <Input
                                        label="Descripción Corta"
                                        name="descripcion_corta"
                                        value={formData.descripcion_corta}
                                        onChange={handleInputChange}
                                        error={formErrors.descripcion_corta}
                                        placeholder="Breve descripción del producto"
                                    />
                                </div>
                                
                                <div className={styles.priceRow}>
                                    <div className={styles.formGroup}>
                                        <Input
                                            label="Precio"
                                            name="precio"
                                            type="number"
                                            step="0.01"
                                            value={formData.precio}
                                            onChange={handleInputChange}
                                            error={formErrors.precio}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <Input
                                            label="Precio de Oferta"
                                            name="precio_oferta"
                                            type="number"
                                            step="0.01"
                                            value={formData.precio_oferta}
                                            onChange={handleInputChange}
                                            error={formErrors.precio_oferta}
                                        />
                                    </div>
                                </div>
                                
                                <div className={styles.priceRow}>
                                    <div className={styles.formGroup}>
                                        <Input
                                            label="Stock"
                                            name="stock"
                                            type="number"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            error={formErrors.stock}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Unidad de Medida</label>
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
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Categoría <span className={styles.required}>*</span>
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <select
                                            name="categoria"
                                            value={formData.categoria}
                                            onChange={handleInputChange}
                                            className={styles.select}
                                            style={{ flex: 1 }}
                                            required
                                        >
                                            <option value="">Seleccionar Categoría</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="small"
                                            onClick={() => setShowCategoryModal(true)}
                                            title="Agregar nueva categoría"
                                        >
                                            <FaFolderPlus /> Nueva
                                        </Button>
                                    </div>
                                    {formErrors.categoria && (
                                        <span className={styles.errorText}>{formErrors.categoria}</span>
                                    )}
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        className={styles.textarea}
                                        rows="4"
                                        placeholder="Descripción detallada del producto..."
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <Input
                                        label="Etiquetas (separadas por coma)"
                                        name="etiquetas"
                                        value={formData.etiquetas}
                                        onChange={handleInputChange}
                                        placeholder="ej: tecnología, innovación, software"
                                    />
                                </div>

                                {/* Image Upload Section */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Imágenes del Producto</label>
                                    <div className={styles.imageUploadArea}>
                                        <label className={styles.uploadButton}>
                                            <FaUpload /> {uploadingImage ? 'Subiendo...' : 'Subir Imágenes'}
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                        <p className={styles.uploadHint}>Formatos permitidos: JPG, PNG, GIF. Máx 5MB</p>
                                    </div>
                                    
                                    {/* Display existing images (for edit mode) */}
                                    {existingImages.length > 0 && (
                                        <div className={styles.imageGallery}>
                                            <h4>Imágenes Actuales</h4>
                                            <div className={styles.imageGrid}>
                                                {existingImages.map(img => (
                                                    <div key={img.id} className={styles.imageItem}>
                                                        <img src={img.url_absoluta || img.url} alt="Product" />
                                                        <div className={styles.imageOverlay}>
                                                            {img.es_principal && <span className={styles.mainBadge}>Principal</span>}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetMainImage(img.id)}
                                                                className={styles.setMainBtn}
                                                                title="Establecer como principal"
                                                            >
                                                                ★
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteImage(img.id)}
                                                                className={styles.deleteImageBtn}
                                                                title="Eliminar imagen"
                                                            >
                                                                <FaTrashAlt />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Display new images to upload */}
                                    {newImages.length > 0 && (
                                        <div className={styles.imageGallery}>
                                            <h4>Imágenes Nuevas</h4>
                                            <div className={styles.imageGrid}>
                                                {newImages.map((img, idx) => (
                                                    <div key={idx} className={styles.imageItem}>
                                                        <img src={img.preview} alt="Preview" />
                                                        <div className={styles.imageOverlay}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteNewImage(idx)}
                                                                className={styles.deleteImageBtn}
                                                            >
                                                                <FaTrashAlt />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.modalFooter}>
                                <Button type="button" variant="outline" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" loading={submitting}>
                                    <FaSave /> {editingProduct ? 'Actualizar' : 'Guardar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Creation Modal */}
            {showCategoryModal && (
                <div className={styles.modal} onClick={handleCloseCategoryModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Crear Nueva Categoría</h2>
                            <button className={styles.closeBtn} onClick={handleCloseCategoryModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(); }}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <Input
                                        label="Nombre de la Categoría"
                                        name="nombre"
                                        value={newCategory.nombre}
                                        onChange={handleCategoryInputChange}
                                        error={formErrors.nombre}
                                        placeholder="ej: Electrónicos, Ropa, Alimentos"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Descripción (Opcional)</label>
                                    <textarea
                                        name="descripcion"
                                        value={newCategory.descripcion}
                                        onChange={handleCategoryInputChange}
                                        className={styles.textarea}
                                        rows="3"
                                        placeholder="Breve descripción de la categoría..."
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <Button type="button" variant="outline" onClick={handleCloseCategoryModal}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" loading={categorySubmitting}>
                                    <FaSave /> Crear Categoría
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