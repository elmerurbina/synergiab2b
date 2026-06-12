import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../../contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, 
  FaSave, FaEdit, FaKey, FaHeart, FaShoppingBag,
  FaUpload, FaCamera, FaTimes, FaCheckCircle
} from 'react-icons/fa';
import styles from './CompradorProfile.module.css';

const CompradorProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { updateProfile, changePassword, loading: profileLoading } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telefono: '',
    ubicacion: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [stats, setStats] = useState({
    total_favoritos: 0,
    total_valoraciones: 0,
    productos_vistos: 0
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        telefono: user.telefono || '',
        ubicacion: user.ubicacion || '',
      });
      setImagePreview(user.profile_image || user.foto_perfil || null);
      
      // Load user stats
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // You can add API calls here to get actual stats
      // For now, using mock data or data from context
      setStats({
        total_favoritos: user?.stats?.total_favoritos || 0,
        total_valoraciones: user?.stats?.total_valoraciones || 0,
        productos_vistos: user?.stats?.productos_vistos || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede superar los 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida');
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
    setLoading(true);
    
    try {
      const submitData = { ...formData };
      
      if (selectedImage) {
        submitData.profile_image = selectedImage;
      }
      
      const response = await updateProfile(submitData);
      
      if (response && response.user) {
        await refreshUser();
        toast.success('Perfil actualizado exitosamente');
        setIsEditing(false);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });
      
      toast.success('Contraseña cambiada exitosamente');
      setIsChangingPassword(false);
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.old_password || error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className={styles.statInfo}>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.profileTitle}>Mi Perfil</h1>
          <p className={styles.profileSubtitle}>
            Gestiona tu información personal y preferencias
          </p>
        </div>
        {!isEditing && !isChangingPassword && (
          <button 
            className={styles.editButton}
            onClick={() => setIsEditing(true)}
          >
            <FaEdit /> Editar Perfil
          </button>
        )}
      </div>

      <div className={styles.profileGrid}>
        {/* Left Column - Avatar and Stats */}
        <div className={styles.leftColumn}>
          <div className={styles.avatarCard}>
            <div className={styles.avatarContainer}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <FaUser size={60} />
                </div>
              )}
              {isEditing && (
                <label className={styles.uploadButton}>
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <h2 className={styles.userName}>{user?.username || 'Usuario'}</h2>
            <p className={styles.userRole}>Comprador</p>
            <p className={styles.userSince}>
              Miembro desde {user?.fecha_creacion ? new Date(user.fecha_creacion).toLocaleDateString('es-ES') : 'Reciente'}
            </p>
          </div>

          <div className={styles.statsCard}>
            <h3>Estadísticas</h3>
            <div className={styles.statsGrid}>
              <StatCard
                icon={<FaHeart />}
                title="Favoritos"
                value={stats.total_favoritos}
                color="#EC4899"
              />
              <StatCard
                icon={<FaCheckCircle />}
                title="Valoraciones"
                value={stats.total_valoraciones}
                color="#10B981"
              />
              <StatCard
                icon={<FaShoppingBag />}
                title="Productos Vistos"
                value={stats.productos_vistos}
                color="#3B82F6"
              />
            </div>
          </div>

          <div className={styles.quickActionsCard}>
            <h3>Acciones Rápidas</h3>
            <button 
              className={styles.quickActionBtn}
              onClick={() => navigate('/my-favorites')}
            >
              <FaHeart /> Mis Favoritos
            </button>
            <button 
              className={styles.quickActionBtn}
              onClick={() => navigate('/products')}
            >
              <FaShoppingBag /> Explorar Productos
            </button>
            {!isChangingPassword && !isEditing && (
              <button 
                className={styles.quickActionBtn}
                onClick={() => setIsChangingPassword(true)}
              >
                <FaKey /> Cambiar Contraseña
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Profile Form */}
        <div className={styles.rightColumn}>
          {isEditing ? (
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2>Editar Perfil</h2>
                <button 
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedImage(null);
                    if (user) {
                      setFormData({
                        username: user.username || '',
                        email: user.email || '',
                        telefono: user.telefono || '',
                        ubicacion: user.ubicacion || '',
                      });
                      setImagePreview(user.profile_image || user.foto_perfil || null);
                    }
                  }}
                >
                  <FaTimes /> Cancelar
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>
                    <FaUser /> Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <FaEnvelope /> Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                    disabled
                  />
                  <small className={styles.fieldNote}>El correo no se puede modificar</small>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <FaPhone /> Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej: +505 1234 5678"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <FaMapMarkerAlt /> Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    placeholder="Ej: Managua, Nicaragua"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={loading || profileLoading}
                  >
                    <FaSave /> {loading || profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          ) : isChangingPassword ? (
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2>Cambiar Contraseña</h2>
                <button 
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      old_password: '',
                      new_password: '',
                      confirm_password: '',
                    });
                  }}
                >
                  <FaTimes /> Cancelar
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Contraseña Actual</label>
                  <input
                    type="password"
                    name="old_password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    required
                    className={styles.input}
                    placeholder="Ingresa tu contraseña actual"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Nueva Contraseña</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    className={styles.input}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    className={styles.input}
                    placeholder="Confirma tu nueva contraseña"
                  />
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={loading}
                  >
                    <FaKey /> {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className={styles.infoCard}>
              <div className={styles.infoHeader}>
                <h2>Información Personal</h2>
              </div>
              
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>
                    <FaUser /> Nombre de Usuario
                  </div>
                  <div className={styles.infoValue}>{user?.username || 'No especificado'}</div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>
                    <FaEnvelope /> Correo Electrónico
                  </div>
                  <div className={styles.infoValue}>{user?.email || 'No especificado'}</div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>
                    <FaPhone /> Teléfono
                  </div>
                  <div className={styles.infoValue}>{user?.telefono || 'No especificado'}</div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>
                    <FaMapMarkerAlt /> Ubicación
                  </div>
                  <div className={styles.infoValue}>{user?.ubicacion || 'No especificado'}</div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>
                    📅 Fecha de Registro
                  </div>
                  <div className={styles.infoValue}>
                    {user?.fecha_creacion ? new Date(user.fecha_creacion).toLocaleDateString('es-ES') : 'No especificado'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompradorProfile;