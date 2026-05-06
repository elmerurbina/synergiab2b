// components/Auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button/Button';
import Input from '../UI/Input/Input';
import styles from './Auth.module.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Correo electrónico inválido';
        }
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const result = await login({
                email: formData.email,
                password: formData.password
            });
            
            if (result.success) {
                console.log('Login successful, user data:', result.user);
                
                toast.success(`¡Bienvenido ${result.user.username || result.user.email}!`, {
                    position: "top-right",
                    autoClose: 3000,
                });
                
                // Navigate based on role
                if (result.user.rol === 'proveedor') {
                    navigate('/dashboard/proveedor');
                } else if (result.user.rol === 'admin') {
                    navigate('/dashboard/admin');
                } else {
                    navigate('/');
                }
            } else {
                setErrors({ general: result.error });
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Error al conectar con el servidor';
            setErrors({ general: errorMsg });
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h2>Iniciar Sesión</h2>
                    <p>Bienvenido de vuelta a SinergiaB2B</p>
                </div>

                {errors.general && (
                    <div className={styles.errorAlert}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <Input
                        type="email"
                        name="email"
                        label="Correo Electrónico"
                        placeholder="ejemplo@empresa.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        iconLeft={<FaEnvelope />}
                        required
                    />

                    <div className={styles.passwordField}>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            label="Contraseña"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            iconLeft={<FaLock />}
                            iconRight={
                                <span onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            }
                            required
                        />
                    </div>

                    <div className={styles.formOptions}>
                        <label className={styles.checkbox}>
                            <input type="checkbox" /> Recordarme
                        </label>
                        <Link to="/forgot-password" className={styles.forgotLink}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className={styles.registerLink}>
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;