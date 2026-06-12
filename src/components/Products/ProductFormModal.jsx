import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaFolderPlus, FaUpload, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Button from '../UI/Button/Button';
import { categoryAPI, productAPI } from '../../services/api';
import styles from './ProductFormModal.module.css';

const ProductFormModal = ({ isOpen, onClose, product, onSuccess, categories: initialCategories }) => {
    const [categories, setCategories] = useState(initialCategories || []);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newImages, setNewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [newCategory, setNewCategory] = useState({ nombre: '', descripcion: '' });
    const [categorySubmitting, setCategorySubmitting] = useState(false);
    
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
        if (product) {
            setFormData({
                nombre: product.nombre || '',
                descripcion: product.descripcion || '',
                descripcion_corta: product.descripcion_corta || '',
                precio: product.precio || '',
                precio_oferta: product.precio_oferta || '',
                stock: product.stock || '',
                unidad_medida: product.unidad_medida || 'unidad',
                categoria: product.categoria?.id || product.categoria || '',
                ubicacion: product.ubicacion?.id || '',
                etiquetas: product.etiquetas?.map(e => e.nombre).join(', ') || ''
            });
            
            if (product.id) {
                loadProductImages(product.id);
            }
        } else {
            resetForm();
        }
    }, [product]);

    const loadProductImages = async (productId) => {
        try {
            const response = await productAPI.getProduct(productId);
            setExistingImages(response.data.imagenes || []);
        } catch (error) {
            console.error('Error loading images:', error);
        }
    };

    const resetForm = () => {
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
        setFormErrors({});
        setNewImages([]);
        setExistingImages([]);
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'nombre':
                if (!value || !value.trim()) return 'El nombre del producto es requerido';
                if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
                if (value.length > 100) return 'El nombre debe tener menos de 100 caracteres';
                return '';
            case 'descripcion_corta':
                if (!value || !value.trim()) return 'La descripción corta es requerida';
                if (value.length < 10) return 'La descripción corta debe tener al menos 10 caracteres';
                if (value.length > 200) return 'La descripción corta debe tener menos de 200 caracteres';
                return '';
            case 'descripcion':
                if (!value || !value.trim()) return 'La descripción del producto es requerida';
                if (value.length < 20) return 'La descripción debe tener al menos 20 caracteres';
                if (value.length > 2000) return 'La descripción debe tener menos de 2000 caracteres';
                return '';
            case 'precio':
                if (!value) return 'El precio es requerido';
                if (parseFloat(value) <= 0) return 'El precio debe ser mayor a 0';
                return '';
            case 'precio_oferta':
                if (value && parseFloat(value) >= parseFloat(formData.precio)) {
                    return 'El precio de oferta debe ser menor al precio regular';
                }
                return '';
            case 'stock':
                if (value && parseInt(value) < 0) return 'El stock no puede ser negativo';
                return '';
            case 'categoria':
                if (!value) return 'Debes seleccionar una categoría';
                return '';
            case 'etiquetas':
                if (value) {
                    const tags = value.split(',').map(tag => tag.trim());
                    if (tags.length > 10) return 'Máximo 10 etiquetas permitidas';
                    for (const tag of tags) {
                        if (tag.length > 30) return 'Cada etiqueta debe tener menos de 30 caracteres';
                    }
                }
                return '';
            default:
                return '';
        }
    };

    const validateForm = () => {
        const errors = {};
        const fieldsToValidate = ['nombre', 'descripcion_corta', 'descripcion', 'precio', 'categoria'];
        
        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) errors[field] = error;
        });
        
        if (formData.precio_oferta) {
            const error = validateField('precio_oferta', formData.precio_oferta);
            if (error) errors.precio_oferta = error;
        }
        
        if (formData.stock) {
            const error = validateField('stock', formData.stock);
            if (error) errors.stock = error;
        }
        
        if (formData.etiquetas) {
            const error = validateField('etiquetas', formData.etiquetas);
            if (error) errors.etiquetas = error;
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // Add new images to state for preview
        const newImageObjects = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
            uploading: false
        }));
        
        setNewImages(prev => [...prev, ...newImageObjects]);
        toast.success(`${files.length} imagen(es) seleccionada(s) para subir`);
        
        e.target.value = '';
    };

    const handleDeleteNewImage = (index) => {
        const imageToDelete = newImages[index];
        if (imageToDelete.preview) {
            URL.revokeObjectURL(imageToDelete.preview);
        }
        setNewImages(prev => prev.filter((_, i) => i !== index));
        toast.info('Imagen eliminada de la lista');
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) return;
        
        try {
            await productAPI.deleteImage(imageId);
            toast.success('Imagen eliminada exitosamente');
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch (error) {
            toast.error('Error al eliminar la imagen');
        }
    };

    const handleSetMainImage = async (imageId) => {
        try {
            await productAPI.setMainImage(imageId);
            toast.success('Imagen principal actualizada');
            await loadProductImages(product.id);
        } catch (error) {
            toast.error('Error al establecer imagen principal');
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategory.nombre.trim()) {
            toast.error('El nombre de la categoría es requerido');
            return;
        }
        
        if (newCategory.nombre.length < 2) {
            toast.error('El nombre debe tener al menos 2 caracteres');
            return;
        }
        
        setCategorySubmitting(true);
        try {
            const response = await categoryAPI.createCategory(newCategory);
            toast.success('¡Categoría creada exitosamente!');
            
            const categoriesResponse = await categoryAPI.getCategories();
            setCategories(categoriesResponse.data.results || categoriesResponse.data || []);
            
            setFormData(prev => ({ ...prev, categoria: response.data.id }));
            setShowCategoryModal(false);
            setNewCategory({ nombre: '', descripcion: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al crear la categoría');
        } finally {
            setCategorySubmitting(false);
        }
    };

    // FIXED: This function now uses FormData instead of JSON
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }
        
        setLoading(true);
        
        try {
            let response;
            
            if (product?.id) {
                // UPDATE EXISTING PRODUCT
                if (newImages.length > 0) {
                    // If there are new images, use FormData for update
                    const formDataToSend = new FormData();
                    formDataToSend.append('nombre', formData.nombre);
                    formDataToSend.append('descripcion', formData.descripcion);
                    formDataToSend.append('descripcion_corta', formData.descripcion_corta);
                    formDataToSend.append('precio', formData.precio);
                    formDataToSend.append('stock', formData.stock || '0');
                    formDataToSend.append('unidad_medida', formData.unidad_medida);
                    formDataToSend.append('categoria', formData.categoria);
                    
                    if (formData.precio_oferta) {
                        formDataToSend.append('precio_oferta', formData.precio_oferta);
                    }
                    
                    if (formData.ubicacion) {
                        formDataToSend.append('ubicacion', formData.ubicacion);
                    }
                    
                    if (formData.etiquetas) {
                        const etiquetasArray = formData.etiquetas.split(',').map(tag => tag.trim());
                        etiquetasArray.forEach(tag => {
                            if (tag) formDataToSend.append('etiquetas', tag);
                        });
                    }
                    
                    // Append new images
                    newImages.forEach((image, index) => {
                        formDataToSend.append('imagenes', image.file);
                    });
                    
                    response = await productAPI.updateProduct(product.id, formDataToSend);
                    toast.success('¡Producto actualizado exitosamente!');
                } else {
                    // No new images, use JSON
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
                    
                    if (formData.precio_oferta) {
                        productData.precio_oferta = parseFloat(formData.precio_oferta);
                    }
                    
                    if (formData.ubicacion) {
                        productData.ubicacion = parseInt(formData.ubicacion);
                    }
                    
                    response = await productAPI.updateProduct(product.id, productData);
                    toast.success('¡Producto actualizado exitosamente!');
                }
            } else {
                // CREATE NEW PRODUCT - ALWAYS use FormData when there are images
                const formDataToSend = new FormData();
                
                // Add all text fields
                formDataToSend.append('nombre', formData.nombre);
                formDataToSend.append('descripcion', formData.descripcion);
                formDataToSend.append('descripcion_corta', formData.descripcion_corta);
                formDataToSend.append('precio', formData.precio);
                formDataToSend.append('stock', formData.stock || '0');
                formDataToSend.append('unidad_medida', formData.unidad_medida);
                formDataToSend.append('categoria', formData.categoria);
                
                if (formData.precio_oferta) {
                    formDataToSend.append('precio_oferta', formData.precio_oferta);
                }
                
                if (formData.ubicacion) {
                    formDataToSend.append('ubicacion', formData.ubicacion);
                }
                
                // Add etiquetas as array
                if (formData.etiquetas) {
                    const etiquetasArray = formData.etiquetas.split(',').map(tag => tag.trim());
                    etiquetasArray.forEach(tag => {
                        if (tag) formDataToSend.append('etiquetas', tag);
                    });
                }
                
                // Add images - CRITICAL: Images must be in FormData
                if (newImages.length === 0) {
                    toast.error('Debes seleccionar al menos una imagen para el producto');
                    setLoading(false);
                    return;
                }
                
                newImages.forEach((image, index) => {
                    formDataToSend.append('imagenes', image.file);
                });
                
                console.log('📤 Sending FormData with fields:', [...formDataToSend.keys()]);
                console.log('📸 Number of images:', newImages.length);
                
                response = await productAPI.createProduct(formDataToSend);
                toast.success('¡Producto creado exitosamente!');
            }
            
            if (onSuccess) onSuccess();
            onClose();
            
        } catch (error) {
            console.error('Error saving product:', error);
            if (error.response?.status === 415) {
                toast.error('Error: Tipo de contenido no soportado. Por favor intenta de nuevo.');
            } else if (error.response?.data) {
                const errorMessage = Object.values(error.response.data).flat().join(', ');
                toast.error(errorMessage || 'Error al guardar el producto');
                setFormErrors(error.response.data);
            } else {
                toast.error('Error al guardar el producto');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            {/* Nombre del Producto */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Nombre del Producto <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className={`${styles.input} ${formErrors.nombre ? styles.inputError : ''}`}
                                    placeholder="Ej: Laptop HP Pavilion"
                                />
                                {formErrors.nombre && <span className={styles.errorText}>{formErrors.nombre}</span>}
                            </div>
                            
                            {/* Descripción Corta */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Descripción Corta <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="descripcion_corta"
                                    value={formData.descripcion_corta}
                                    onChange={handleInputChange}
                                    className={`${styles.input} ${formErrors.descripcion_corta ? styles.inputError : ''}`}
                                    placeholder="Breve descripción del producto (mínimo 10 caracteres)"
                                />
                                <span className={styles.charCount}>
                                    {formData.descripcion_corta?.length || 0}/200 (mínimo 10)
                                </span>
                                {formErrors.descripcion_corta && <span className={styles.errorText}>{formErrors.descripcion_corta}</span>}
                            </div>
                            
                            {/* Descripción Completa */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Descripción <span className={styles.required}>*</span>
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    className={`${styles.textarea} ${formErrors.descripcion ? styles.inputError : ''}`}
                                    rows="6"
                                    placeholder="Descripción detallada del producto (mínimo 20 caracteres)..."
                                />
                                <span className={styles.charCount}>
                                    {formData.descripcion?.length || 0} caracteres (mínimo 20)
                                </span>
                                {formErrors.descripcion && <span className={styles.errorText}>{formErrors.descripcion}</span>}
                            </div>
                            
                            {/* Precios */}
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Precio <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleInputChange}
                                        className={`${styles.input} ${formErrors.precio ? styles.inputError : ''}`}
                                        placeholder="0.00"
                                    />
                                    {formErrors.precio && <span className={styles.errorText}>{formErrors.precio}</span>}
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Precio de Oferta</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="precio_oferta"
                                        value={formData.precio_oferta}
                                        onChange={handleInputChange}
                                        className={`${styles.input} ${formErrors.precio_oferta ? styles.inputError : ''}`}
                                        placeholder="0.00"
                                    />
                                    {formErrors.precio_oferta && <span className={styles.errorText}>{formErrors.precio_oferta}</span>}
                                </div>
                            </div>
                            
                            {/* Stock y Unidad */}
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Stock</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        className={`${styles.input} ${formErrors.stock ? styles.inputError : ''}`}
                                        placeholder="0"
                                    />
                                    {formErrors.stock && <span className={styles.errorText}>{formErrors.stock}</span>}
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
                            
                            {/* Categoría */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Categoría <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.categorySelector}>
                                    <select
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleInputChange}
                                        className={`${styles.select} ${formErrors.categoria ? styles.inputError : ''}`}
                                    >
                                        <option value="">Seleccionar Categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryModal(true)}
                                        className={styles.addCategoryBtn}
                                    >
                                        <FaFolderPlus /> Nueva
                                    </button>
                                </div>
                                {formErrors.categoria && <span className={styles.errorText}>{formErrors.categoria}</span>}
                            </div>
                            
                            {/* Etiquetas */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Etiquetas (separadas por coma)</label>
                                <input
                                    type="text"
                                    name="etiquetas"
                                    value={formData.etiquetas}
                                    onChange={handleInputChange}
                                    className={`${styles.input} ${formErrors.etiquetas ? styles.inputError : ''}`}
                                    placeholder="ej: tecnología, innovación, software"
                                />
                                <span className={styles.hint}>Máximo 10 etiquetas, 30 caracteres cada una</span>
                                {formErrors.etiquetas && <span className={styles.errorText}>{formErrors.etiquetas}</span>}
                            </div>
                            
                            {/* Imágenes */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Imágenes del Producto {!product && <span className={styles.required}>*</span>}
                                </label>
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
                                    <p className={styles.uploadHint}>
                                        Formatos: JPG, PNG, GIF. Máx 5MB por imagen
                                        {!product && <span className={styles.required}> * Obligatorio al menos una imagen</span>}
                                    </p>
                                </div>
                                
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
                                
                                {newImages.length > 0 && (
                                    <div className={styles.imageGallery}>
                                        <h4>Imágenes Nuevas ({newImages.length})</h4>
                                        <div className={styles.imageGrid}>
                                            {newImages.map((img, idx) => (
                                                <div key={idx} className={styles.imageItem}>
                                                    <img src={img.preview} alt="Preview" />
                                                    <div className={styles.imageOverlay}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteNewImage(idx)}
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
                            </div>
                        </div>
                        
                        <div className={styles.modalFooter}>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" loading={loading}>
                                <FaSave /> {product ? 'Actualizar' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Category Creation Modal */}
            {showCategoryModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCategoryModal(false)}>
                    <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Crear Nueva Categoría</h2>
                            <button className={styles.closeBtn} onClick={() => setShowCategoryModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nombre de la Categoría <span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    value={newCategory.nombre}
                                    onChange={(e) => setNewCategory({ ...newCategory, nombre: e.target.value })}
                                    className={styles.input}
                                    placeholder="ej: Electrónicos, Ropa, Alimentos"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Descripción (Opcional)</label>
                                <textarea
                                    value={newCategory.descripcion}
                                    onChange={(e) => setNewCategory({ ...newCategory, descripcion: e.target.value })}
                                    className={styles.textarea}
                                    rows="3"
                                    placeholder="Breve descripción de la categoría..."
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="button" variant="primary" onClick={handleCreateCategory} loading={categorySubmitting}>
                                <FaSave /> Crear Categoría
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductFormModal;