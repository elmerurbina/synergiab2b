// App.js
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext'; // Add this import
import Layout from './components/Layout/Layout/Layout';
import Hero from './components/Hero/Hero';
import PopularCategories from './components/Categories/PopularCategories';
import ProductsSection from './components/Products/ProductsSection';
import TeamSection from './components/Team/TeamSection';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ManageCatalog from './pages/ManageCatalog/ManageCatalog';
import VendedorHome from './pages/VendedorHome/VendedorHome';
import CompradorHome from './pages/CompradorHome/CompradorHome';
import ProductGrid from './components/Products/ProductGrid';
import ProvidersSection from './components/Providers/ProvidersSection';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import VendedorProfile from './pages/Profile/Vendedor/VendedorProfile';
import './styles/global.css';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    
    
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <p>Verificando autenticación...</p>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
       
        return <Navigate to="/unauthorized" replace />;
    }
    
  
    return children;
};

// Public Route component
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <div>Cargando...</div>;
    }
    
    if (isAuthenticated) {
    
        return <Navigate to="/" replace />;
    }
    

    return children;
};

// Home Page component
const HomePage = () => {
    const { user, isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    
    
    if (isAuthenticated) {
        if (user?.rol === 'proveedor') {
            return <VendedorHome />;
        } else if (user?.rol === 'comprador') {
            return <CompradorHome />;
        }
    }
    
    return (
        <>
            <Hero onSearch={setSearchQuery} />
            <ProductsSection initialSearch={searchQuery} />
            <ProvidersSection onSelectProvider={setSearchQuery} />
            <PopularCategories />
            <TeamSection />
        </>
    );
};

// Dashboard components
const ProveedorDashboard = () => {
    const { user } = useAuth();
    return (
        <div style={{ padding: 'var(--spacing-2xl)' }}>
            <h1>Dashboard Proveedor</h1>
            <p>Bienvenido, {user?.empresa || user?.username}</p>
        </div>
    );
};

const AdminDashboard = () => {
    const { user } = useAuth();
    return (
        <div style={{ padding: 'var(--spacing-2xl)' }}>
            <h1>Dashboard Administrador</h1>
            <p>Panel de administración de SinergiaB2B</p>
            <p>Bienvenido, {user?.username}</p>
        </div>
    );
};

// Profile route wrapper with ProfileProvider
const ProfileRouteWrapper = ({ children }) => {
    return (
        <ProfileProvider>
            {children}
        </ProfileProvider>
    );
};

// Main App Content with routes
const AppContent = () => {
    const { loading } = useAuth();
    
    console.log('📱 App rendering, loading:', loading);
    
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <p>Cargando aplicación...</p>
            </div>
        );
    }
    
    return (
        <Layout showSidebar={false}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route 
                    path="/products" 
                    element={
                        <div style={{ padding: 'var(--spacing-xl) 0' }}>
                            <ProductGrid />
                        </div>
                    } 
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/register" 
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } 
                />

                {/* Profile Route - Wrapped with ProfileProvider */}
                <Route 
                    path="/profile/vendedor" 
                    element={
                        <ProtectedRoute allowedRoles={['proveedor']}>
                            <ProfileRouteWrapper>
                                <VendedorProfile />
                            </ProfileRouteWrapper>
                        </ProtectedRoute>
                    } 
                />
                
                {/* Protected Routes - Proveedor only */}
                <Route 
                    path="/manage-catalog" 
                    element={
                        <ProtectedRoute allowedRoles={['proveedor']}>
                            <ManageCatalog />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Protected Routes - Require Authentication */}
                <Route 
                    path="/dashboard/proveedor" 
                    element={
                        <ProtectedRoute allowedRoles={['proveedor']}>
                            <ProveedorDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/admin" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* ToastContainer - Debe estar aquí para mostrar las notificaciones */}
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="system"
            />
        </Layout>
    );
};

// Main App component
function App() {
    console.log('🚀 App starting...');
    
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;