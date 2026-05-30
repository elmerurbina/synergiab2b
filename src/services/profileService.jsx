// src/services/profileService.js
import api from './api';

const profileService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
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
      
      const response = await api.put('/auth/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password/', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default profileService;