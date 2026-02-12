import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="navbar"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{ cursor: 'pointer', zIndex: 103 }}
        >
          <h3 style={{
            color: 'white',
            letterSpacing: '2px',
            fontWeight: 800
          }}>
            PLS<span style={{ color: 'var(--primary)' }}>STORE</span>
          </h3>
        </motion.div>

        {/* Desktop Menu */}
        <ul className="nav-links">
          {['Accueil', 'Services', 'À propos'].map((item, i) => (
            <motion.li key={i} whileHover={{ y: -2 }}>
              <button>
                {item}
              </button>
            </motion.li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`mobile-menu ${isOpen ? 'open' : ''}`}
          >
            {['Accueil', 'Services', 'À propos'].map((item, i) => (
              <motion.button
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {item}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
