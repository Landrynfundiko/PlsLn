import React, { useState, useEffect } from 'react'
import { auth } from "../config/firebase"
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, ShieldAlert, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Conexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const ADMIN_EMAIL = "landrynfundiko3@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        navigate('/admin/stats');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      toast.error("Accès refusé. Seul l'administrateur est autorisé.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;
      
      if (user.email === ADMIN_EMAIL) {
        toast.success("Connexion réussie !");
        navigate('/admin/stats');
      } else {
        toast.error("Accès non autorisé.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion : " + (error.message.includes("auth/invalid-credential") ? "Identifiants invalides" : "Identifiants incorrects"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, var(--surface) 0%, var(--bg) 100%)',
      padding: '20px',
      position: 'relative',
      transition: 'background 0.3s ease'
    }}>
      <Toaster position="top-right" reverseOrder={false} />

      <button 
        onClick={toggleTheme} 
        className="theme-toggle-floating"
        aria-label="Changer de thème"
        type="button"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="login-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: theme === 'dark' ? 'rgba(45, 32, 24, 0.45)' : 'rgba(245, 242, 223, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          transition: 'background 0.3s ease, border-color 0.3s ease'
        }}
      >
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}
          >
            <div style={{ 
              padding: '16px', 
              background: 'rgba(199, 206, 105, 0.08)', 
              borderRadius: '20px',
              border: '1px solid rgba(199, 206, 105, 0.2)' 
            }}>
              <LogIn size={32} color="var(--primary)" />
            </div>
          </motion.div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>
            PLS ADMIN
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Espace d'administration et de gestion
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="input-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identifiant Admin
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder='admin@plsstore.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '14px 16px 14px 48px',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: theme === 'dark' ? 'rgba(26, 20, 18, 0.6)' : 'rgba(26, 20, 18, 0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
              />
            </div>
          </div>

          <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="input-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: '14px 16px 14px 48px',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: theme === 'dark' ? 'rgba(26, 20, 18, 0.6)' : 'rgba(26, 20, 18, 0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
              />
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '12px', 
            background: 'rgba(190, 54, 29, 0.05)', 
            border: '1px solid rgba(190, 54, 29, 0.15)',
            borderRadius: '12px',
            marginTop: '4px'
          }}>
            <ShieldAlert size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Cet accès est hautement sécurisé et réservé uniquement à la gestion interne de la boutique.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              background: 'var(--primary)',
              color: 'black',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px',
              boxShadow: '0 8px 16px rgba(199, 206, 105, 0.15)',
              transition: 'background 0.3s'
            }}
          >
            {loading ? "Vérification..." : "Entrer dans l'administration"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
