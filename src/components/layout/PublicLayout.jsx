import React from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const PublicLayout = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      background: '#fff',
    }}>
      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
};

export default PublicLayout;