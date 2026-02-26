import React from 'react';
import { motion } from 'framer-motion';
import dnImage from '../../assets/DN.PNG';

export default function Corps() {
  return (
    <section
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '0 5%',
        background: 'radial-gradient(circle at top right, #1a1a2e 0%, #0f0f1a 100%)',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      {/* Dynamic Background Glows */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(111, 0, 255, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(255, 0, 128, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0
      }} />

      <div
        className="hero-content"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          width: '100%',
          maxWidth: '1200px',
          zIndex: 1,
          flexWrap: 'wrap-reverse',
          gap: '80px'
        }}
      >
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="hero-text"
          style={{ flex: '1 1 500px', zIndex: 2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
              marginBottom: '2rem'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ffcc',
              marginRight: '12px',
              boxShadow: '0 0 10px #00ffcc'
            }}></span>
            <span style={{
              color: '#e0e0e0',
              letterSpacing: '3px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'uppercase'
            }}>
              Nouvelle Collection #026
            </span>
          </motion.div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(4rem, 9vw, 8rem)',
            fontWeight: 800,
            lineHeight: 1,
            color: '#ffffff',
            marginBottom: '1rem',
            letterSpacing: '-1px',
            textShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            Airmax <br />
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-2px',
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              background: 'linear-gradient(135deg, #00ffcc 0%, #ff007f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 15px rgba(255,0,127,0.3))'
            }}>
              Tendance
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(255, 255, 255, 0.65)',
            lineHeight: 1.7,
            maxWidth: '480px',
            marginBottom: '3rem',
            fontWeight: 300,
            letterSpacing: '0.5px'
          }}>
            Conçu pour capturer l'esprit du moment et transformer chaque pas en une démonstration de style asbolue. L'innovation à vos pieds.
          </p>

          <motion.button
            onClick={() => {
              const boutiqueSection = document.getElementById('boutique');
              if (boutiqueSection) {
                boutiqueSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 15px 30px -10px rgba(0, 255, 204, 0.4)',
              background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)'
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '18px 45px',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              border: 'none',
              borderRadius: '50px',
              color: '#0f0f1a',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: '0 10px 20px -5px rgba(255,255,255,0.2)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
          >
            Découvrir
          </motion.button>
        </motion.div>

        {/* Hero Image Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
          className="hero-image-container"
          style={{
            flex: '1 1 450px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '500px'
          }}
        >
          {/* Circular Rings Background */}
          <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute',
                width: '80%',
                paddingBottom: '80%',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute',
                width: '100%',
                paddingBottom: '100%',
                border: '1px dashed rgba(0, 255, 204, 0.15)',
                borderRadius: '50%',
              }}
            />
          </div>

          <motion.img
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            src={dnImage}
            alt="Airmax DN"
            style={{
              width: '120%',
              maxWidth: '700px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(30px 50px 40px rgba(0,0,0,0.8))',
              transform: 'rotate(-10deg)',
              zIndex: 10
            }}
          />


        </motion.div>
      </div>
    </section>
  );
}
