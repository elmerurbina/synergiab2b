// components/Auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    FaEnvelope, FaLock, FaUser, FaBuilding, FaPhone, 
    FaEye, FaEyeSlash, FaCheckCircle 
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/auth';
import Button from '../UI/Button/Button';
import Input from '../UI/Input/Input';
import styles from './Auth.module.css';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password2: '',
        rol: 'comprador',
        empresa: '',
        telefono: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength <= 2) return 'Débil';
        if (passwordStrength <= 3) return 'Regular';
        if (passwordStrength <= 4) return 'Buena';
        return 'Fuerte';
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return '#D32F2F';
        if (passwordStrength <= 3) return '#F57C00';
        if (passwordStrength <= 4) return '#1E88E5';
        return '#2E7D32';
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Correo electrónico inválido';
        }
        
        if (!formData.username) {
            newErrors.username = 'El nombre de usuario es requerido';
        } else if (formData.username.length < 3) {
            newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        }
        
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }
        
        if (!formData.password2) {
            newErrors.password2 = 'Confirma tu contraseña';
        } else if (formData.password !== formData.password2) {
            newErrors.password2 = 'Las contraseñas no coinciden';
        }
        
        if (formData.rol === 'proveedor' && !formData.empresa) {
            newErrors.empresa = 'El nombre de la empresa es requerido para proveedores';
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
            // First, register the user
            const response = await authAPI.register(formData);
            
            if (response.status === 201) {
                toast.success(`¡Cuenta creada exitosamente!`, {
                    position: "top-right",
                    autoClose: 3000,
                });
                
                // Auto-login after successful registration
                toast.info('Iniciando sesión automáticamente...', {
                    position: "top-right",
                    autoClose: 2000,
                });
                
                // Login with the newly created credentials
                const loginResult = await login({
                    email: formData.email,
                    password: formData.password
                });
                
                if (loginResult.success) {
                    toast.success(`¡Bienvenido a SinergiaB2B ${loginResult.user.username || loginResult.user.email}!`, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    
                    // Navigate based on role
                    if (loginResult.user.rol === 'proveedor') {
                        navigate('/dashboard/proveedor');
                    } else {
                        navigate('/');
                    }
                } else {
                    // If auto-login fails, redirect to login page
                    toast.warning('Registro exitoso. Por favor inicia sesión.', {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response?.data) {
                const errorsData = error.response.data;
                setErrors(errorsData);
                
                // Show toast for each error
                Object.keys(errorsData).forEach(key => {
                    if (Array.isArray(errorsData[key])) {
                        toast.error(`${key}: ${errorsData[key][0]}`, {
                            position: "top-right",
                            autoClose: 5000,
                        });
                    } else if (typeof errorsData[key] === 'string') {
                        toast.error(errorsData[key], {
                            position: "top-right",
                            autoClose: 5000,
                        });
                    } else if (typeof errorsData[key] === 'object') {
                        // Handle nested errors
                        Object.values(errorsData[key]).forEach(nestedError => {
                            if (Array.isArray(nestedError)) {
                                toast.error(nestedError[0], {
                                    position: "top-right",
                                    autoClose: 5000,
                                });
                            }
                        });
                    }
                });
            } else {
                const errorMsg = 'Error al conectar con el servidor';
                setErrors({ general: errorMsg });
                toast.error(errorMsg, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h2>Crear Cuenta</h2>
                    <p>Únete a SinergiaB2B y comienza a conectar</p>
                </div>

                {errors.general && (
                    <div className={styles.errorAlert}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="rol"
                                value="comprador"
                                checked={formData.rol === 'comprador'}
                                onChange={handleChange}
                            />
                            <span className={styles.radioText}>Soy Comprador</span>
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="rol"
                                value="proveedor"
                                checked={formData.rol === 'proveedor'}
                                onChange={handleChange}
                            />
                            <span className={styles.radioText}>Soy Proveedor</span>
                        </label>
                    </div>

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

                    <Input
                        type="text"
                        name="username"
                        label="Nombre de Usuario"
                        placeholder="usuario123"
                        value={formData.username}
                        onChange={handleChange}
                        error={errors.username}
                        iconLeft={<FaUser />}
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
                        {formData.password && (
                            <div className={styles.passwordStrength}>
                                <div className={styles.strengthBarContainer}>
                                    <div 
                                        className={styles.strengthBar}
                                        style={{
                                            width: `${(passwordStrength / 5) * 100}%`,
                                            backgroundColor: getPasswordStrengthColor()
                                        }}
                                    />
                                </div>
                                <span style={{ color: getPasswordStrengthColor() }}>
                                    {getPasswordStrengthText()}
                                </span>
                            </div>
                        )}
                    </div>

                    <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="password2"
                        label="Confirmar Contraseña"
                        placeholder="••••••••"
                        value={formData.password2}
                        onChange={handleChange}
                        error={errors.password2}
                        iconLeft={<FaCheckCircle />}
                        iconRight={
                            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.passwordToggle}>
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        }
                        required
                    />

                    {formData.rol === 'proveedor' && (
                        <>
                            <Input
                                type="text"
                                name="empresa"
                                label="Nombre de la Empresa"
                                placeholder="Mi Empresa S.A."
                                value={formData.empresa}
                                onChange={handleChange}
                                error={errors.empresa}
                                iconLeft={<FaBuilding />}
                                required
                            />
                            
                            <Input
                                type="tel"
                                name="telefono"
                                label="Teléfono"
                                placeholder="+505 1234 5678"
                                value={formData.telefono}
                                onChange={handleChange}
                                error={errors.telefono}
                                iconLeft={<FaPhone />}
                            />
                        </>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                    </Button>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className={styles.loginLink}>
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;