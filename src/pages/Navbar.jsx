import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const isAdmin = user && user.email === "landrynfundiko3@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const navItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Services', path: null },
    { label: 'À propos', path: null },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="navbar"
        style={{
          background: 'rgba(15, 15, 26, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{ cursor: 'pointer' }}
          onClick={() => handleNav("/")}
          className="nav-logo"
        >
          <h3 style={{ fontFamily: "'Playfair Display', serif" }}>PLS<span style={{ color: '#00ffcc' }}>STORE</span></h3>
        </motion.div>

        {/* Nav Links — masqués en mobile */}
        <ul className="nav-links">
          {navItems.map((item, i) => (
            <motion.li key={i} whileHover={{ y: -2 }}>
              <button onClick={() => item.path ? handleNav(item.path) : null}>
                {item.label}
              </button>
            </motion.li>
          ))}
          {isAdmin && (
            <motion.li whileHover={{ y: -2 }}>
              <button
                onClick={() => handleNav("/admin/stock")}
                style={{ color: '#ff007f', fontWeight: '800' }}
              >
                Admin
              </button>
            </motion.li>
          )}
        </ul>

        {/* Icônes + Hamburger */}
        <div className="nav-icons">
          <button onClick={() => handleNav("/cart")} style={{ position: 'relative' }} className="nav-icon-btn">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
          <button onClick={() => handleNav("/connexion")} className="nav-icon-btn" style={{ color: user ? 'var(--primary)' : 'white' }}>
            <User size={22} />
          </button>
          {/* Hamburger — visible seulement en mobile */}
          <button
            className="nav-icon-btn nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="nav-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="nav-mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
            >
              <div className="nav-mobile-links">
                {navItems.map((item, i) => (
                  <button key={i} onClick={() => item.path ? handleNav(item.path) : setMenuOpen(false)}>
                    {item.label}
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => handleNav("/admin/stock")}
                    style={{ color: 'var(--primary)', fontWeight: '700' }}
                  >
                    Admin
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
