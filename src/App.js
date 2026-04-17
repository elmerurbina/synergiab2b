import React from 'react';
import Layout from './components/Layout/Layout/Layout';
import Hero from './components/Hero/Hero';
import PopularCategories from './components/Categories/PopularCategories';
import ProductsSection from './components/Products/ProductsSection';
import TeamSection from './components/Team/TeamSection';
import './styles/global.css';

function App() {
    return (
        <Layout showSidebar={false}>
            <Hero />
            <ProductsSection />
            <PopularCategories />
            <TeamSection />
        </Layout>
    );
}

export default App;