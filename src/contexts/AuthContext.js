import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/auth';
import profileService from '../services/profileService';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const isChecking = useRef(false);

    // Helper function to process user data and ensure consistent field names
    const processUserData = useCallback((userData) => {
        if (!userData) return null;
        
        const processedUser = { ...userData };
        
        // Map foto_perfil to profile_image if needed
        if (userData.foto_perfil && !userData.profile_image) {
            processedUser.profile_image = userData.foto_perfil;
        }
        
        // If profile_image is a relative path, convert to absolute URL
        if (processedUser.profile_image && typeof processedUser.profile_image === 'string') {
            // Check if it's a relative path
            if (processedUser.profile_image.startsWith('/media/') || processedUser.profile_image.startsWith('/media')) {
                const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                processedUser.profile_image = `${baseURL}${processedUser.profile_image}`;
            }
        }
        
        // Ensure full URL for profile_image
        if (processedUser.profile_image && !processedUser.profile_image.startsWith('http')) {
            const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            processedUser.profile_image = `${baseURL}${processedUser.profile_image}`;
        }
        
        return processedUser;
    }, []);

    // Load user profile data from API
    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.log('No token found, skipping loadUser');
            return null;
        }
        
        try {
            console.log('🔄 Loading user profile from API...');
            const response = await profileService.getProfile();
            
            let userData = response;
            if (response.user) {
                userData = response.user;
            } else if (response.data) {
                userData = response.data;
            }
            
            const processedUser = processUserData(userData);
            setUser(processedUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(processedUser));
            
            console.log('✅ User profile loaded:', processedUser?.empresa || processedUser?.username);
            console.log('✅ Profile image URL:', processedUser?.profile_image);
            return processedUser;
        } catch (error) {
            console.error('❌ Error loading user profile:', error);
            return null;
        }
    }, [processUserData]);

    const checkAuthStatus = useCallback(async () => {
        if (isChecking.current) {
            console.log('🔐 Auth check already in progress, skipping...');
            return;
        }
        
        console.log('🔐 Checking authentication status...');
        
        try {
            isChecking.current = true;
            setLoading(true);
            
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.log('🔐 No token found');
                setUser(null);
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }
            
            // Try to load user from localStorage first for faster initial render
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    const processedStoredUser = processUserData(parsedUser);
                    setUser(processedStoredUser);
                    setIsAuthenticated(true);
                } catch (e) {
                    console.error('Error parsing stored user:', e);
                }
            }
            
            // Then fetch fresh data from API
            const response = await authAPI.getProfile();
            console.log('✅ Auth check successful:', response.data);
            
            if (response.data) {
                const processedUser = processUserData(response.data);
                setUser(processedUser);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(processedUser));
                console.log('✅ Profile image URL from API:', processedUser?.profile_image);
            }
        } catch (error) {
            console.error('❌ Auth check failed:', error.message);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
            isChecking.current = false;
        }
    }, [processUserData]);

    const login = async (credentials) => {
        console.log('🔐 Attempting login...');
        try {
            const response = await authAPI.login(credentials);
            
            console.log('📦 Login response:', response.data);
            
            if (response.status === 200 && response.data.user) {
                console.log('✅ Login successful, processing user data...');
                
                // Process user data first
                const processedUser = processUserData(response.data.user);
                console.log('📸 Processed user with image:', processedUser.profile_image);
                
                // Update state
                setUser(processedUser);
                setIsAuthenticated(true);
                
                // Store in localStorage
                localStorage.setItem('user', JSON.stringify(processedUser));
                
                // IMPORTANT: Load fresh profile data from API to ensure latest image
                console.log('🔄 Fetching fresh profile data...');
                try {
                    const freshProfile = await profileService.getProfile();
                    let freshUserData = freshProfile;
                    if (freshProfile.user) freshUserData = freshProfile.user;
                    if (freshProfile.data) freshUserData = freshProfile.data;
                    
                    const processedFreshUser = processUserData(freshUserData);
                    setUser(processedFreshUser);
                    localStorage.setItem('user', JSON.stringify(processedFreshUser));
                    console.log('✅ Fresh profile loaded:', processedFreshUser.profile_image);
                } catch (profileError) {
                    console.error('Error loading fresh profile:', profileError);
                    // Fall back to login response data
                }
                
                return { success: true, user: processedUser };
            }
            return { success: false, error: 'Login failed - no user data' };
        } catch (error) {
            console.error('❌ Login error:', error);
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.message || 
                               'Credenciales inválidas';
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        console.log('🔐 Logging out...');
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            console.log('✅ Logout complete');
        }
    };

    const register = async (userData) => {
        console.log('🔐 Registering user...');
        try {
            const response = await authAPI.register(userData);
            
            if (response.status === 201 && response.data.user) {
                console.log('✅ Registration successful:', response.data.user);
                const processedUser = processUserData(response.data.user);
                setUser(processedUser);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(processedUser));
                
                return { success: true, user: processedUser };
            }
            return { success: false, error: 'Registration failed - no user data' };
        } catch (error) {
            console.error('❌ Registration error:', error);
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.message || 
                               'Error al registrar usuario';
            return { success: false, error: errorMessage };
        }
    };

    const refreshToken = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token');
            }
            
            const response = await authAPI.refreshToken(refreshToken);
            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                return response.data.access;
            }
            throw new Error('No access token in response');
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            return null;
        }
    }, []);

    // Force refresh user data (useful after profile updates)
    const refreshUser = useCallback(async () => {
        console.log('🔄 Force refreshing user data...');
        const updatedUser = await loadUser();
        return updatedUser;
    }, [loadUser]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        register,
        checkAuthStatus,
        refreshToken,
        loadUser,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;