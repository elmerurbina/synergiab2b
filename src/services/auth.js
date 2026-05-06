import axiosInstance from './axios';

export const authAPI = {
    login: async (credentials) => {
        console.log('🔐 authAPI.login called with:', credentials.email);
        const response = await axiosInstance.post('/auth/login/', credentials);
        
        // Guardar tokens en localStorage
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }
        
        return response;
    },
    
    register: async (userData) => {
        console.log('📝 authAPI.register called');
        const response = await axiosInstance.post('/auth/register/', userData);
        
        // Guardar tokens en localStorage
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }
        
        return response;
    },
    
    logout: async () => {
        console.log('🚪 authAPI.logout called');
        try {
            await axiosInstance.post('/auth/logout/');
        } finally {
            // Limpiar localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    },
    
    getProfile: () => {
        console.log('👤 authAPI.getProfile called');
        return axiosInstance.get('/auth/profile/');
    },
    
    updateProfile: (data) => {
        console.log('✏️ authAPI.updateProfile called');
        return axiosInstance.put('/auth/profile/', data);
    },
    
    changePassword: (data) => {
        console.log('🔑 authAPI.changePassword called');
        return axiosInstance.post('/auth/change-password/', data);
    },
    
    refreshToken: async () => {
        console.log('🔄 authAPI.refreshToken called');
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axiosInstance.post('/auth/refresh/', {
            refresh: refreshToken
        });
        
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
        }
        
        return response;
    }
};