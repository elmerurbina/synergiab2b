// src/components/ContactForm/ContactForm.jsx
import React, { useState } from 'react';
import { FaPaperPlane, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import emailService from '../../services/emailService';
import styles from './ContactForm.module.css';

const ContactForm = ({ 
  title = "Envíanos un Mensaje",
  subtitle = "Completa el formulario y te responderemos lo antes posible",
  showConfirmation = true,
  onSuccess = null,
  onError = null,
  customClass = ""
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.asunto.trim()) {
      newErrors.asunto = 'El asunto es requerido';
    }
    
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    } else if (formData.mensaje.trim().length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }
    
    setLoading(true);
    
    try {
      // Send main contact email
      const result = await emailService.sendContactEmail(formData);
      
      if (result.success) {
        // Send confirmation email to user (optional)
        if (showConfirmation) {
          await emailService.sendConfirmationEmail(formData);
        }
        
        setSubmitted(true);
        toast.success('Mensaje enviado exitosamente. Te responderemos pronto.');
        
        // Reset form
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          asunto: '',
          mensaje: ''
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(formData);
        }
        
        // Reset submitted status after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Error al enviar el mensaje. Por favor intenta de nuevo.');
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    });
    setErrors({});
  };

  return (
    <div className={`${styles.formContainer} ${customClass}`}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      
      {submitted && (
        <div className={styles.successMessage}>
          <FaCheck />
          <div>
            <strong>¡Mensaje enviado!</strong>
            <p>Gracias por contactarnos. Te responderemos a la brevedad posible.</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre">
              Nombre Completo <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? styles.error : ''}
              placeholder="Tu nombre completo"
              disabled={loading}
            />
            {errors.nombre && <span className={styles.errorMessage}>{errors.nombre}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">
              Correo Electrónico <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? styles.error : ''}
              placeholder="tu@email.com"
              disabled={loading}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="telefono">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+505 1234 5678"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="asunto">
              Asunto <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="asunto"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              className={errors.asunto ? styles.error : ''}
              placeholder="Motivo de contacto"
              disabled={loading}
            />
            {errors.asunto && <span className={styles.errorMessage}>{errors.asunto}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mensaje">
            Mensaje <span className={styles.required}>*</span>
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            className={errors.mensaje ? styles.error : ''}
            rows="6"
            placeholder="Escribe tu mensaje aquí..."
            disabled={loading}
          ></textarea>
          {errors.mensaje && <span className={styles.errorMessage}>{errors.mensaje}</span>}
        </div>

        <div className={styles.formActions}>
          <button 
            type="button" 
            onClick={handleReset}
            className={styles.resetButton}
            disabled={loading}
          >
            Limpiar
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>Enviando...</>
            ) : (
              <>
                <FaPaperPlane />
                Enviar Mensaje
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;