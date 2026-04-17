import React, { useState } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

const Layout = ({ children, showSidebar = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {showSidebar ? (
          <div className={styles.withSidebar}>
            <div className={styles.sidebarContainer}>
              <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
            </div>
            <div className={styles.contentContainer}>
              <div className={styles.content}>{children}</div>
            </div>
          </div>
        ) : (
          <div className={styles.withoutSidebar}>
            <div className={styles.content}>{children}</div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;