import React, { useState } from 'react';
import styles from './Input.module.css';

const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
  success = false,
  helperText,
  size = 'medium',
  iconLeft,
  iconRight,
  onIconRightClick,
  className = '',
  floatingLabel = false,
  options = [], // For select options
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = [
    styles.input,
    styles[size],
    error && styles.error,
    success && styles.success,
    iconLeft && styles.withIconLeft,
    (iconRight || type === 'password') && styles.withIconRight,
    type === 'textarea' && styles.textarea,
    type === 'select' && styles.select,
    type === 'search' && styles.searchInput,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleIconRightClick = () => {
    if (type === 'password') {
      setShowPassword(!showPassword);
    } else if (onIconRightClick) {
      onIconRightClick();
    }
  };

  const getRightIcon = () => {
    if (type === 'password') {
      return showPassword ? '👁️' : '👁️‍🗨️';
    }
    return iconRight;
  };

  const inputProps = {
    name,
    value,
    onChange,
    placeholder: floatingLabel ? ' ' : placeholder,
    disabled,
    className: inputClasses,
    id: name,
    ...props,
  };

  // Handle different input types
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            rows={props.rows || 4}
          />
        );

      case 'select':
        return (
          <select {...inputProps}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            {...inputProps}
            type={type === 'password' && showPassword ? 'text' : type}
          />
        );
    }
  };

  return (
    <div className={`${styles.inputGroup} ${floatingLabel ? styles.floatingLabelGroup : ''}`}>
      {label && !floatingLabel && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.labelRequired}>*</span>}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}

        {renderInput()}

        {(iconRight || type === 'password') && (
          <span className={styles.iconRight} onClick={handleIconRightClick}>
            {getRightIcon()}
          </span>
        )}

        {type === 'search' && (
          <button type="submit" className={styles.searchButton}>
            🔍
          </button>
        )}
      </div>

      {floatingLabel && label && (
        <label htmlFor={name} className={styles.floatingLabel}>
          {label}
          {required && <span className={styles.labelRequired}>*</span>}
        </label>
      )}

      {error && <span className={styles.errorMessage}>{error}</span>}
      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
};

export default Input;