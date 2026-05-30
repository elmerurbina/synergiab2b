// src/pages/Profile/Vendedor/components/ProfileHeader.jsx
import React from 'react';
import { FaStore, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import styles from '../VendedorProfile.module.css';

const ProfileHeader = ({ profile, stats }) => {
  return (
    <div className={styles.profileHeader}>
      <div className={styles.profileCover}>
        <div className={styles.profileAvatar}>
          {profile?.profile_image ? (
            <img src={profile.profile_image} alt={profile.empresa || profile.username} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <FaStore size={60} />
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.profileInfo}>
        <h1 className={styles.profileName}>{profile?.empresa || profile?.username}</h1>
        <p className={styles.profileRole}>Proveedor Verificado</p>
        
        <div className={styles.profileDetails}>
          {profile?.email && (
            <div className={styles.detailItem}>
              <FaEnvelope />
              <span>{profile.email}</span>
            </div>
          )}
          {profile?.telefono && (
            <div className={styles.detailItem}>
              <FaPhone />
              <span>{profile.telefono}</span>
            </div>
          )}
          {profile?.ubicacion && (
            <div className={styles.detailItem}>
              <FaMapMarkerAlt />
              <span>{profile.ubicacion}</span>
            </div>
          )}
          <div className={styles.detailItem}>
            <FaCalendarAlt />
            <span>Miembro desde {new Date(profile?.fecha_creacion).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>

      {stats && (
        <div className={styles.profileStats}>
          <div className={styles.statBox}>
            <h3>{stats.total_productos || 0}</h3>
            <p>Productos</p>
          </div>
          <div className={styles.statBox}>
            <h3>{stats.productos_activos || 0}</h3>
            <p>Activos</p>
          </div>
          <div className={styles.statBox}>
            <h3>{stats.total_visitas || 0}</h3>
            <p>Visitas</p>
          </div>
          <div className={styles.statBox}>
            <h3>{stats.total_interacciones || 0}</h3>
            <p>Contactos</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;