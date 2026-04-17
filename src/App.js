import React from 'react';
import Layout from './components/Layout/Layout/Layout';
import Hero from './components/Hero/Hero';
import PopularCategories from './components/Categories/PopularCategories';
import ProductsSection from './components/Products/ProductsSection';
import './styles/global.css';

function App() {
  return (
    <Layout showSidebar={false}>
      <Hero />
        <ProductsSection />
      <PopularCategories />
    </Layout>
  );
}

export default App;