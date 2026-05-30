// src/pages/Profile/Vendedor/components/ChangePasswordForm.jsx
import React, { useState } from 'react';
import { FaLock, FaSave, FaTimes } from 'react-icons/fa';
import styles from '../VendedorProfile.module.css';

const ChangePasswordForm = ({ onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.old_password) {
      newErrors.old_password = 'La contraseña actual es requerida';
    }
    
    if (!formData.new_password) {
      newErrors.new_password = 'La nueva contraseña es requerida';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      await onSave({
        old_password: formData.old_password,
        new_password: formData.new_password
      });
      // Clear form on success
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.passwordForm}>
      <h2>Cambiar Contraseña</h2>
      
      <div className={styles.formGroup}>
        <label>
          <FaLock />
          <span>Contraseña Actual</span>
        </label>
        <input
          type="password"
          name="old_password"
          value={formData.old_password}
          onChange={handleChange}
          className={errors.old_password ? styles.error : ''}
        />
        {errors.old_password && <span className={styles.errorMessage}>{errors.old_password}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>
          <FaLock />
          <span>Nueva Contraseña</span>
        </label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          className={errors.new_password ? styles.error : ''}
        />
        {errors.new_password && <span className={styles.errorMessage}>{errors.new_password}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>
          <FaLock />
          <span>Confirmar Nueva Contraseña</span>
        </label>
        <input
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          className={errors.confirm_password ? styles.error : ''}
        />
        {errors.confirm_password && <span className={styles.errorMessage}>{errors.confirm_password}</span>}
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          <FaTimes />
          Cancelar
        </button>
        <button type="submit" disabled={loading} className={styles.saveButton}>
          <FaSave />
          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;