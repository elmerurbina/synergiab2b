// src/services/profileService.js
import api from './api';

const profileService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/accounts/profile/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_image' && profileData[key] !== undefined && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });
      
      // Append image if present
      if (profileData.profile_image && profileData.profile_image instanceof File) {
        formData.append('profile_image', profileData.profile_image);
      }
      
      const response = await api.put('/accounts/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/accounts/change-password/', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload company documents (optional)
  uploadDocument: async (documentType, file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);
      
      const response = await api.post('/accounts/upload-document/', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default profileService;