// src/pages/Profile/Vendedor/components/ProfileForm.jsx
import React, { useState } from 'react';
import { FaSave, FaTimes, FaUpload, FaBuilding, FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import styles from '../VendedorProfile.module.css';

const ProfileForm = ({ profile, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    empresa: profile?.empresa || '',
    username: profile?.username || '',
    email: profile?.email || '',
    telefono: profile?.telefono || '',
    ubicacion: profile?.ubicacion || '',
    sitio_web: profile?.sitio_web || '',
    descripcion: profile?.descripcion || '',
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(profile?.profile_image || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (selectedImage) {
      submitData.profile_image = selectedImage;
    }
    await onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.profileForm}>
      <div className={styles.formSection}>
        <h2>Información de la Empresa</h2>
        
        <div className={styles.imageUploadSection}>
          <div className={styles.imagePreview}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" />
            ) : (
              <div className={styles.previewPlaceholder}>
                <FaBuilding size={40} />
              </div>
            )}
          </div>
          <label className={styles.uploadButton}>
            <FaUpload />
            <span>Subir Logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
          <small>Formatos: JPG, PNG, GIF (Max 5MB)</small>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>
              <FaBuilding />
              <span>Nombre de la Empresa *</span>
            </label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              required
              placeholder="Ej: SinergiaB2B S.A."
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FaUser />
              <span>Nombre de Usuario *</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FaEnvelope />
              <span>Correo Electrónico *</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="empresa@ejemplo.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FaPhone />
              <span>Teléfono</span>
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+505 1234 5678"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FaMapMarkerAlt />
              <span>Ubicación</span>
            </label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              placeholder="Managua, Nicaragua"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FaGlobe />
              <span>Sitio Web</span>
            </label>
            <input
              type="url"
              name="sitio_web"
              value={formData.sitio_web}
              onChange={handleChange}
              placeholder="https://www.miempresa.com"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Descripción de la Empresa</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="5"
            placeholder="Describe tu empresa, productos y servicios que ofreces..."
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          <FaTimes />
          Cancelar
        </button>
        <button type="submit" disabled={loading} className={styles.saveButton}>
          <FaSave />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;