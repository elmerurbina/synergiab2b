import axiosInstance from './axios';

// Productos API
export const productAPI = {
    getProducts: (params = {}) => {
        return axiosInstance.get('/productos/', { params });
    },

   uploadImage: (formData) => {
    return axiosInstance.post('/productos/imagenes/', formData);
},
    
    deleteImage: (imageId) => {
        return axiosInstance.delete(`/productos/imagenes/${imageId}/`);
    },
    
    setMainImage: (imageId) => {
        return axiosInstance.post(`/productos/imagenes/${imageId}/principal/`);
    },
    
    getProduct: (id) => {
        return axiosInstance.get(`/productos/${id}/`);
    },
    
    createProduct: (data) => {
        return axiosInstance.post('/productos/crear/', data);
    },
    
    updateProduct: (id, data) => {
        return axiosInstance.put(`/productos/${id}/editar/`, data);
    },
    
    deleteProduct: (id) => {
        return axiosInstance.delete(`/productos/${id}/eliminar/`);
    },
    
    getMyProducts: () => {
        return axiosInstance.get('/productos/mis-productos/');
    },
    
    getSponsoredProducts: () => {
        return axiosInstance.get('/productos/patrocinados/');
    },
    
    getFilterOptions: () => {
        return axiosInstance.get('/productos/filtros/');
    }
};

// Categorías API
export const categoryAPI = {
    getCategories: (params = {}) => {
        return axiosInstance.get('/categorias/', { params });
    },
    
    getCategory: (slug) => {
        return axiosInstance.get(`/categorias/${slug}/`);
    },
    
    getCategoryProducts: (slug, params = {}) => {
        return axiosInstance.get(`/categorias/${slug}/productos/`, { params });
    },
    
    getSubcategories: (parentId) => {
        return axiosInstance.get(`/categorias/subcategorias/${parentId}/`);
    },
    
    // ADD THIS METHOD HERE - NOT in interactionAPI
    createCategory: (data) => {
        return axiosInstance.post('/categorias/crear/', data);
    }
};

// Ubicaciones API
export const locationAPI = {
    getLocations: (params = {}) => {
        return axiosInstance.get('/ubicaciones/', { params });
    },
    
    getDepartments: () => {
        return axiosInstance.get('/ubicaciones/departamentos/');
    },
    
    getLocation: (id) => {
        return axiosInstance.get(`/ubicaciones/${id}/`);
    },
    
    getLocationProducts: (id, params = {}) => {
        return axiosInstance.get(`/ubicaciones/${id}/productos/`, { params });
    },
    
    getProviderLocations: () => {
        return axiosInstance.get('/ubicaciones/proveedor/');
    },
    
    createProviderLocation: (data) => {
        return axiosInstance.post('/ubicaciones/proveedor/', data);
    },
    
    updateProviderLocation: (id, data) => {
        return axiosInstance.put(`/ubicaciones/proveedor/${id}/`, data);
    },
    
    deleteProviderLocation: (id) => {
        return axiosInstance.delete(`/ubicaciones/proveedor/${id}/`);
    }
};

// Favoritos API
export const favoriteAPI = {
    getFavorites: (params = {}) => {
        return axiosInstance.get('/favoritos/', { params });
    },
    
    addFavorite: (productoId) => {
        return axiosInstance.post('/favoritos/agregar/', { producto_id: productoId });
    },
    
    removeFavorite: (productoId) => {
        return axiosInstance.delete(`/favoritos/eliminar/${productoId}/`);
    },
    
    checkFavorite: (productoId) => {
        return axiosInstance.get(`/favoritos/verificar/?producto_id=${productoId}`);
    },
    
    getFavoritesCount: () => {
        return axiosInstance.get('/favoritos/contar/');
    }
};

// Interacciones API
export const interactionAPI = {
    registerInteraction: (productoId, tipo) => {
        return axiosInstance.post('/interacciones/registrar/', {
            producto_id: productoId,
            tipo: tipo
        });
    },
    
    getGlobalStats: (params = {}) => {
        return axiosInstance.get('/interacciones/estadisticas/', { params });
    },
    
    getProductStats: (productoId, params = {}) => {
        return axiosInstance.get(`/interacciones/estadisticas/producto/${productoId}/`, { params });
    },
    
    getProviderStats: (params = {}) => {
        return axiosInstance.get('/interacciones/estadisticas/proveedor/', { params });
    },
    
    getTopProducts: (params = {}) => {
        return axiosInstance.get('/interacciones/top/', { params });
    }
};

// Valoraciones (Ratings) API
export const ratingAPI = {
    getRatings: (productoId, params = {}) => {
        return axiosInstance.get('/interacciones/valoraciones/', { params: { producto_id: productoId, ...params } });
    },
    createRating: (productoId, puntuacion, comentario = '') => {
        return axiosInstance.post('/interacciones/valoraciones/crear/', {
            producto_id: productoId,
            puntuacion: puntuacion,
            comentario: comentario
        });
    },
    deleteRating: (productoId) => {
        return axiosInstance.delete(`/interacciones/valoraciones/eliminar/${productoId}/`);
    },
    getUserProductRating: (productoId) => {
        return axiosInstance.get(`/interacciones/valoraciones/producto/${productoId}/`);
    }
};