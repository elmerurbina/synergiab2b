import React from 'react';
import Layout from './components/Layout/Layout/Layout';
import Hero from './components/Hero/Hero';
import './styles/global.css';

function App() {
  return (
    <Layout showSidebar={false}>
      <Hero />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          Categorías Populares
        </h2>
        {/* Rest of your content */}
      </div>
    </Layout>
  );
}

export default App;