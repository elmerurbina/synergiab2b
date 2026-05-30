// src/pages/Profile/Vendedor/VendedorProfile.jsx
import React, { useState, useEffect } from 'react';
import { useProfile } from '../../../contexts/ProfileContext';
import { FaEdit, FaKey, FaStore, FaChartLine } from 'react-icons/fa';
import ProfileHeader from './components/ProfileHeader';
import ProfileForm from './components/ProfileForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import styles from './VendedorProfile.module.css';

const VendedorProfile = () => {
  const { profile, stats, loading, updateProfile, changePassword, loadProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (profileData) => {
    await updateProfile(profileData);
    setIsEditing(false);
  };

  const handleChangePassword = async (passwordData) => {
    await changePassword(passwordData);
    setIsChangingPassword(false);
  };

  const tabs = [
    { id: 'info', label: 'Información General', icon: <FaStore /> },
    { id: 'stats', label: 'Estadísticas', icon: <FaChartLine /> }
  ];

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        {/* Profile Header */}
        <ProfileHeader profile={profile} stats={stats} />

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {!isEditing && !isChangingPassword && (
            <>
              <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                <FaEdit />
                Editar Perfil
              </button>
              <button onClick={() => setIsChangingPassword(true)} className={styles.passwordButton}>
                <FaKey />
                Cambiar Contraseña
              </button>
            </>
          )}
        </div>

        {/* Tabs */}
        {!isEditing && !isChangingPassword && (
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'info' && (
                <div className={styles.infoSection}>
                  <div className={styles.infoCard}>
                    <h3>Detalles de la Empresa</h3>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <strong>Empresa:</strong>
                        <span>{profile?.empresa || 'No especificado'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <strong>Usuario:</strong>
                        <span>{profile?.username}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <strong>Email:</strong>
                        <span>{profile?.email}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <strong>Teléfono:</strong>
                        <span>{profile?.telefono || 'No especificado'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <strong>Ubicación:</strong>
                        <span>{profile?.ubicacion || 'No especificado'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <strong>Sitio Web:</strong>
                        <span>{profile?.sitio_web || 'No especificado'}</span>
                      </div>
                    </div>
                    {profile?.descripcion && (
                      <div className={styles.infoDescription}>
                        <strong>Descripción:</strong>
                        <p>{profile.descripcion}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'stats' && stats && (
                <div className={styles.statsSection}>
                  <div className={styles.statsCard}>
                    <h3>Estadísticas de Rendimiento</h3>
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total Productos</span>
                        <span className={styles.statValue}>{stats.total_productos || 0}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Productos Activos</span>
                        <span className={styles.statValue}>{stats.productos_activos || 0}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total Visitas</span>
                        <span className={styles.statValue}>{stats.total_visitas || 0}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total Contactos</span>
                        <span className={styles.statValue}>{stats.total_interacciones || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Forms */}
        {isEditing && (
          <ProfileForm
            profile={profile}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
            loading={loading}
          />
        )}

        {isChangingPassword && (
          <ChangePasswordForm
            onSave={handleChangePassword}
            onCancel={() => setIsChangingPassword(false)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default VendedorProfile;