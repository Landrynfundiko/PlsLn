import React from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import dnImage from '../../assets/DN.PNG';

export default function Corps() {
  return (
    <section className="hero-section">

      {/* Background Glow */}
      <div className="hero-glow" />

      <div className="hero-content">

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-text"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              color: 'var(--primary)',
              letterSpacing: '3px',
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'uppercase'
            }}
          >
            New Collection
          </motion.span>

          <h1 className="hero-title">
            TENDANCE <br /> #026
          </h1>

          <p className="hero-description">
            "Airmax Dn, conçu pour capturer l'esprit du moment
            et transformer chaque pas en une démonstration de style."
          </p>

          <motion.a
            href="https://wa.me/243981401138"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(37, 211, 102, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            style={{
              marginTop: '40px',
              padding: '16px 35px',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50px',
              color: 'white',
              fontWeight: '700',
              letterSpacing: '1px',
              cursor: 'pointer',
              fontSize: '1rem',
              boxShadow: '0 10px 20px -5px rgba(37, 211, 102, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <span style={{ zIndex: 1 }}>Discuter sur WhatsApp</span>
            <FaWhatsapp style={{ fontSize: '1.4rem', zIndex: 1 }} />

            {/* Shine effect */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              whileHover={{ x: '100%', opacity: 0.2 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                zIndex: 0
              }}
            />
          </motion.a>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-image-container"
        >
          <motion.img
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            src={dnImage}
            alt="Airmax DN"
            style={{
              width: '120%',
              maxWidth: '550px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 50px 50px rgba(0,0,0,0.5))',
              transform: 'scale(1.2)'
            }}
          />

          {/* Decorative elements behind image */}
          <div style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '100px',
            height: '100px',
            border: '2px solid var(--primary)',
            borderRadius: '50%',
            opacity: 0.2,
            zIndex: -1
          }} />
        </motion.div>
      </div>
    </section>
  )
}
