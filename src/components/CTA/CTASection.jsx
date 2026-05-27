import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button/Button';
import styles from './CTASection.module.css';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>¿Listo para llevar tu negocio al siguiente nivel?</h2>
          <p className={styles.description}>
            Únete a la red B2B más grande de Nicaragua. Conecta con proveedores certificados o expande tu cartera de clientes hoy mismo.
          </p>
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/register')}
              className={styles.btnComprador}
            >
              Registrarme como Comprador
            </Button>
            <Button
              variant="outline"
              size="large"
              onClick={() => navigate('/register')}
              className={styles.btnProveedor}
            >
              Registrarme como Proveedor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
