import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../UI/Button/Button';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Header - User data:', user);
  console.log('Header - Profile image:', user?.profile_image);

  // Refresh user data when component mounts and when authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated) {
        console.log('Header - Refreshing user data...');
        await refreshUser();
        setImageKey(Date.now()); // Force image refresh
      }
    };
    
    loadUserData();
  }, [isAuthenticated, refreshUser]);

  // Listen for storage changes (when login happens in another tab)
  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === 'access_token' && e.newValue) {
        console.log('Storage change detected, refreshing user...');
        await refreshUser();
        setImageKey(Date.now());
        setProfileImageError(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUser]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    console.log('Header - Handling logout');
    await logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/login');
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const isActiveLink = (href) => {
    if (href === '/') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Get profile image URL with cache buster
  const getProfileImageUrl = useCallback(() => {
    if (!user) return null;
    
    let imageUrl = null;
    if (user.profile_image) {
      imageUrl = user.profile_image;
    } else if (user.foto_perfil) {
      imageUrl = user.foto_perfil;
    }
    
    if (imageUrl) {
      // Add cache buster to force image refresh
      const separator = imageUrl.includes('?') ? '&' : '?';
      return `${imageUrl}${separator}t=${imageKey}`;
    }
    return null;
  }, [user, imageKey]);

  const getUserDisplayName = () => {
    if (!user) return 'Usuario';
    if (user.empresa) return user.empresa;
    if (user.full_name) return user.full_name;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name && name !== 'Usuario') {
      return name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getNavLinks = () => {
    const baseLinks = [
      { href: '/', label: 'Inicio' },
      { href: '/products', label: 'Productos' },
      { href: '/categories', label: 'Categorías' },
    ];
    
    if (user?.rol === 'proveedor') {
      baseLinks.push({ href: '/manage-catalog', label: 'Manejar Catálogos' });
      baseLinks.push({ href: '/about', label: 'Nosotros' });
    } else if (user?.rol === 'admin') {
      baseLinks.push({ href: '/admin/products', label: 'Administrar Productos' });
      baseLinks.push({ href: '/admin/users', label: 'Usuarios' });
      baseLinks.push({ href: '/about', label: 'Nosotros' });
    } else {
      baseLinks.push({ href: '/about', label: 'Nosotros' });
      baseLinks.push({ href: '/contact', label: 'Contacto' });
    }
    
    return baseLinks;
  };

  const navLinks = getNavLinks();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest(`.${styles.profileMenuContainer}`)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileMenuOpen]);

  const profileImageUrl = getProfileImageUrl();
  const displayName = getUserDisplayName();
  const userInitials = getUserInitials();

  // Reset error state when image URL changes
  useEffect(() => {
    setProfileImageError(false);
  }, [profileImageUrl]);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/assets/logo.svg" alt="SinergiaB2B" />
          </Link>
          <Link to="/" className={styles.logoText}>
            SinergiaB2B
          </Link>
        </div>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              to={link.href} 
              className={`${styles.navLink} ${isActiveLink(link.href) ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {!isAuthenticated ? (
            <>
              <Button 
                variant="outline" 
                size="small"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
              <Button 
                variant="primary" 
                size="small"
                onClick={() => navigate('/register')}
              >
                Registrarse
              </Button>
            </>
          ) : (
            <div className={styles.userActions}>
              <div className={styles.profileMenuContainer}>
                <button 
                  className={styles.profileButton}
                  onClick={toggleProfileMenu}
                >
                  <div className={styles.profileAvatar}>
                    {profileImageUrl && !profileImageError ? (
                      <img 
                        src={profileImageUrl} 
                        alt="Profile"
                        onError={() => setProfileImageError(true)}
                      />
                    ) : (
                      <span className={styles.avatarInitial}>
                        {userInitials}
                      </span>
                    )}
                  </div>
                  <span className={styles.userName}>
                    {displayName}
                  </span>
                  <span className={`${styles.dropdownArrow} ${isProfileMenuOpen ? styles.arrowUp : ''}`}>
                    ▼
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownAvatar}>
                        {profileImageUrl && !profileImageError ? (
                          <img 
                            src={profileImageUrl} 
                            alt="Profile"
                            onError={() => setProfileImageError(true)}
                          />
                        ) : (
                          <span className={styles.dropdownAvatarInitial}>
                            {userInitials}
                          </span>
                        )}
                      </div>
                      <div className={styles.dropdownUserInfo}>
                        <p className={styles.dropdownUserName}>{displayName}</p>
                        <p className={styles.dropdownUserEmail}>{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className={styles.dropdownDivider}></div>
                    
                    <Link 
                      to={
                        user?.rol === 'proveedor' ? '/profile/vendedor' :
                        user?.rol === 'admin' ? '/profile/admin' : '/profile/comprador'
                      }
                      className={styles.dropdownItem}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className={styles.dropdownIcon}>👤</span>
                      Mi Perfil
                    </Link>
                    
                    {user?.rol === 'proveedor' && (
                      <Link 
                        to="/dashboard/proveedor"
                        className={styles.dropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <span className={styles.dropdownIcon}>📊</span>
                        Dashboard
                      </Link>
                    )}
                    
                    {user?.rol === 'admin' && (
                      <Link 
                        to="/dashboard/admin"
                        className={styles.dropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <span className={styles.dropdownIcon}>⚙️</span>
                        Panel Admin
                      </Link>
                    )}
                    
                    {user?.rol === 'proveedor' && (
                      <Link 
                        to="/manage-catalog"
                        className={styles.dropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <span className={styles.dropdownIcon}>📦</span>
                        Gestionar Catálogo
                      </Link>
                    )}
                    
                    {user?.rol === 'comprador' && (
                      <Link 
                        to="/my-favorites"
                        className={styles.dropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <span className={styles.dropdownIcon}>❤️</span>
                        Mis Favoritos
                      </Link>
                    )}
                    
                    <div className={styles.dropdownDivider}></div>
                    
                    <button 
                      className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                      onClick={handleLogout}
                    >
                      <span className={styles.dropdownIcon}>🚪</span>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.href} 
            to={link.href} 
            className={`${styles.mobileNavLink} ${isActiveLink(link.href) ? styles.mobileActive : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        
        <div className={styles.mobileDivider}></div>
        
        {isAuthenticated && (
          <>
            <div className={styles.mobileProfileSection}>
              <div className={styles.mobileProfileAvatar}>
                {profileImageUrl && !profileImageError ? (
                  <img 
                    src={profileImageUrl} 
                    alt="Profile"
                    onError={() => setProfileImageError(true)}
                  />
                ) : (
                  <span className={styles.mobileAvatarInitial}>
                    {userInitials}
                  </span>
                )}
              </div>
              <div className={styles.mobileProfileInfo}>
                <p className={styles.mobileProfileName}>{displayName}</p>
                <p className={styles.mobileProfileEmail}>{user?.email}</p>
              </div>
            </div>
            
            <div className={styles.mobileDivider}></div>
            
            <Link 
              to={
                user?.rol === 'proveedor' ? '/profile/vendedor' :
                user?.rol === 'admin' ? '/profile/admin' : '/profile/comprador'
              }
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              👤 Mi Perfil
            </Link>
          </>
        )}
        
        <div className={styles.mobileActions}>
          {!isAuthenticated ? (
            <>
              <Button 
                variant="outline" 
                size="medium" 
                fullWidth
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
              >
                Iniciar Sesión
              </Button>
              <Button 
                variant="primary" 
                size="medium" 
                fullWidth
                onClick={() => {
                  navigate('/register');
                  setIsMenuOpen(false);
                }}
              >
                Registrarse
              </Button>
            </>
          ) : (
            <>
              {user?.rol === 'proveedor' && (
                <>
                  <Button 
                    variant="outline" 
                    size="medium" 
                    fullWidth
                    onClick={() => {
                      navigate('/dashboard/proveedor');
                      setIsMenuOpen(false);
                    }}
                  >
                    📊 Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="medium" 
                    fullWidth
                    onClick={() => {
                      navigate('/manage-catalog');
                      setIsMenuOpen(false);
                    }}
                  >
                    📦 Gestionar Catálogo
                  </Button>
                </>
              )}
              {user?.rol === 'admin' && (
                <Button 
                  variant="outline" 
                  size="medium" 
                  fullWidth
                  onClick={() => {
                    navigate('/dashboard/admin');
                    setIsMenuOpen(false);
                  }}
                >
                  ⚙️ Panel Admin
                </Button>
              )}
              {user?.rol === 'comprador' && (
                <Button 
                  variant="outline" 
                  size="medium" 
                  fullWidth
                  onClick={() => {
                    navigate('/my-favorites');
                    setIsMenuOpen(false);
                  }}
                >
                  ❤️ Mis Favoritos
                </Button>
              )}
              <Button 
                variant="danger" 
                size="medium" 
                fullWidth
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                🚪 Cerrar Sesión
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;