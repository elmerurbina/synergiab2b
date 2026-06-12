import axiosInstance from './axios';

const profileService = {
    // Get current user profile
    getProfile: async () => {
        try {
            const response = await axiosInstance.get('/auth/profile/');
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error.response?.data || error;
        }
    },
    
    // Update profile with image support
    updateProfile: async (profileData) => {
        try {
            let dataToSend;
            let headers = {};
            
            // Check if we have a file to upload
            if (profileData.profile_image instanceof File) {
                // Use FormData for file upload
                dataToSend = new FormData();
                
                // Add all text fields
                Object.keys(profileData).forEach(key => {
                    if (key !== 'profile_image' && profileData[key] !== undefined && profileData[key] !== null) {
                        dataToSend.append(key, profileData[key]);
                    }
                });
                
                // Add the image file
                dataToSend.append('profile_image', profileData.profile_image);
                
                // Don't set Content-Type - let browser set it with boundary
                headers = {};
            } else {
                // Regular JSON data
                dataToSend = profileData;
                headers = { 'Content-Type': 'application/json' };
            }
            
            const response = await axiosInstance.put('/auth/profile/', dataToSend, { headers });
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error.response?.data || error;
        }
    },
    
    // Change password
    changePassword: async (passwordData) => {
        try {
            const response = await axiosInstance.post('/auth/change-password/', passwordData);
            return response.data;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error.response?.data || error;
        }
    },
    
    // Get user by ID (for public profiles)
    getUserById: async (userId) => {
        try {
            const response = await axiosInstance.get(`/auth/users/${userId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error.response?.data || error;
        }
    },
    
    // Get proveedor by ID
    getProveedor: async (proveedorId) => {
        try {
            const response = await axiosInstance.get(`/auth/proveedores/${proveedorId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching proveedor:', error);
            throw error.response?.data || error;
        }
    },
    
    // Get all proveedores
    getProveedores: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/auth/proveedores/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching proveedores:', error);
            throw error.response?.data || error;
        }
    }
};

export default profileService;