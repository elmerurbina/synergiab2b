// src/contexts/ProfileContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import profileService from '../services/profileService';
import { toast } from 'react-toastify';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Load profile data
  const loadProfile = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await profileService.updateProfile(profileData);
      setProfile(response.user);
      toast.success(response.message || 'Perfil actualizado exitosamente');
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    setLoading(true);
    try {
      const response = await profileService.changePassword(passwordData);
      toast.success(response.message || 'Contraseña cambiada exitosamente');
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.old_password || error.message || 'Error al cambiar la contraseña');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      setProfile(null);
      setStats(null);
    }
  }, [isAuthenticated]);

  const value = {
    profile,
    stats,
    loading,
    loadProfile,
    updateProfile,
    changePassword
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};