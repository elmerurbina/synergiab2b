import axiosInstance from './axios';

// Productos API
export const productAPI = {
    // Get all products with filters
    getProducts: (params = {}) => {
        return axiosInstance.get('/productos/', { params });
    },
    
    // Get single product
    getProduct: (id) => {
        return axiosInstance.get(`/productos/${id}/`);
    },
    
    // Create product (proveedor only)
    createProduct: (data) => {
        return axiosInstance.post('/productos/crear/', data);
    },
    
    // Update product
    updateProduct: (id, data) => {
        return axiosInstance.put(`/productos/${id}/editar/`, data);
    },
    
    // Delete product
    deleteProduct: (id) => {
        return axiosInstance.delete(`/productos/${id}/eliminar/`);
    },
    
    // Get my products
    getMyProducts: () => {
        return axiosInstance.get('/productos/mis-productos/');
    },
    
    // Get sponsored products
    getSponsoredProducts: () => {
        return axiosInstance.get('/productos/patrocinados/');
    },
    
    // Get filter options
    getFilterOptions: () => {
        return axiosInstance.get('/productos/filtros/');
    }
};

// Categorías API
export const categoryAPI = {
    // Get all categories
    getCategories: (params = {}) => {
        return axiosInstance.get('/categorias/', { params });
    },
    
    // Get single category
    getCategory: (slug) => {
        return axiosInstance.get(`/categorias/${slug}/`);
    },
    
    // Get products by category
    getCategoryProducts: (slug, params = {}) => {
        return axiosInstance.get(`/categorias/${slug}/productos/`, { params });
    },
    
    // Get subcategories
    getSubcategories: (parentId) => {
        return axiosInstance.get(`/categorias/subcategorias/${parentId}/`);
    }
};

// Ubicaciones API
export const locationAPI = {
    // Get all locations
    getLocations: (params = {}) => {
        return axiosInstance.get('/ubicaciones/', { params });
    },
    
    // Get departments
    getDepartments: () => {
        return axiosInstance.get('/ubicaciones/departamentos/');
    },
    
    // Get location detail
    getLocation: (id) => {
        return axiosInstance.get(`/ubicaciones/${id}/`);
    },
    
    // Get products by location
    getLocationProducts: (id, params = {}) => {
        return axiosInstance.get(`/ubicaciones/${id}/productos/`, { params });
    },
    
    // Get provider locations
    getProviderLocations: () => {
        return axiosInstance.get('/ubicaciones/proveedor/');
    },
    
    // Create provider location
    createProviderLocation: (data) => {
        return axiosInstance.post('/ubicaciones/proveedor/', data);
    },
    
    // Update provider location
    updateProviderLocation: (id, data) => {
        return axiosInstance.put(`/ubicaciones/proveedor/${id}/`, data);
    },
    
    // Delete provider location
    deleteProviderLocation: (id) => {
        return axiosInstance.delete(`/ubicaciones/proveedor/${id}/`);
    }
};

// Favoritos API
export const favoriteAPI = {
    // Get user favorites
    getFavorites: (params = {}) => {
        return axiosInstance.get('/favoritos/', { params });
    },
    
    // Add to favorites
    addFavorite: (productoId) => {
        return axiosInstance.post('/favoritos/agregar/', { producto_id: productoId });
    },
    
    // Remove from favorites
    removeFavorite: (productoId) => {
        return axiosInstance.delete(`/favoritos/eliminar/${productoId}/`);
    },
    
    // Check if product is favorite
    checkFavorite: (productoId) => {
        return axiosInstance.get(`/favoritos/verificar/?producto_id=${productoId}`);
    },
    
    // Get favorites count
    getFavoritesCount: () => {
        return axiosInstance.get('/favoritos/contar/');
    }
};

// Interacciones API
export const interactionAPI = {
    // Register interaction
    registerInteraction: (productoId, tipo) => {
        return axiosInstance.post('/interacciones/registrar/', {
            producto_id: productoId,
            tipo: tipo
        });
    },
    
    // Get global statistics (admin only)
    getGlobalStats: (params = {}) => {
        return axiosInstance.get('/interacciones/estadisticas/', { params });
    },
    
    // Get product statistics
    getProductStats: (productoId, params = {}) => {
        return axiosInstance.get(`/interacciones/estadisticas/producto/${productoId}/`, { params });
    },
    
    // Get provider statistics
    getProviderStats: (params = {}) => {
        return axiosInstance.get('/interacciones/estadisticas/proveedor/', { params });
    },
    
    // Get top products
    getTopProducts: (params = {}) => {
        return axiosInstance.get('/interacciones/top/', { params });
    }
};