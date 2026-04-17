import React from 'react';
import Layout from './components/Layout/Layout/Layout';
import Button from './components/UI/Button/Button';
import './styles/global.css';

function App() {
  return (
    <Layout showSidebar={false}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Bienvenido a SinergiaB2B</h1>
        <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          La plataforma líder para el descubrimiento de productos y servicios entre empresas en Nicaragua.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary" size="large">
            Explorar Productos
          </Button>
          <Button variant="secondary" size="large">
            Ver Categorías
          </Button>
          <Button variant="outline" size="large">
            Contactar Ventas
          </Button>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h2>Demo de Estados de Botones</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Button variant="primary">Normal</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;