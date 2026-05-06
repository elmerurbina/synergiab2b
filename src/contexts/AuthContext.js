import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/auth';

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

    const checkAuthStatus = useCallback(async () => {
        if (isChecking.current) {
            console.log('🔐 Auth check already in progress, skipping...');
            return;
        }
        
        console.log('🔐 Checking authentication status...');
        
        try {
            isChecking.current = true;
            setLoading(true);
            
            // Verificar si hay token
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.log('🔐 No token found');
                setUser(null);
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }
            
            const response = await authAPI.getProfile();
            console.log('✅ Auth check successful:', response.data);
            
            if (response.data) {
                setUser(response.data);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(response.data));
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
    }, []);

    const login = async (credentials) => {
        console.log('🔐 Attempting login...');
        try {
            const response = await authAPI.login(credentials);
            
            if (response.status === 200 && response.data.user) {
                console.log('✅ Login successful:', response.data.user);
                setUser(response.data.user);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                return { success: true, user: response.data.user };
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
        await authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
        console.log('✅ Logout complete');
    };

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};