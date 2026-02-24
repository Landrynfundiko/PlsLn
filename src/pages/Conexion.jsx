import React, { useState } from 'react'
import { auth } from "../config/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react'

export default function Conexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_EMAIL = "landrynfundiko3@gmail.com";

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Compte créé avec succès !");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        toast.success("Connexion réussie !");

        if (user.email === ADMIN_EMAIL) {
          navigate('/admin/stock');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur: " + (error.message.includes("auth/invalid-credential") ? "Identifiants invalides" : error.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <Toaster position="top-right" reverseOrder={false} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-card"
      >
        <div className="login-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}
          >
            <div style={{ padding: '15px', background: 'rgba(34, 211, 238, 0.1)', borderRadius: '50%' }}>
              {isRegistering ? <UserPlus size={32} color="var(--primary)" /> : <LogIn size={32} color="var(--primary)" />}
            </div>
          </motion.div>
          <h2>{isRegistering ? "Créer un compte" : "Bon retour"}</h2>
          <p>{isRegistering ? "Rejoignez PLS STORE aujourd'hui" : "Connectez-vous pour continuer vos achats"}</p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder='votre@email.com'
                className="styled-input"
                style={{ paddingLeft: '45px', width: '100%', boxSizing: 'border-box' }}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder='••••••••'
                className="styled-input"
                style={{ paddingLeft: '45px', width: '100%', boxSizing: 'border-box' }}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Chargement..." : (isRegistering ? "S'inscrire" : "Se connecter")}
          </motion.button>
        </form>

        <div className="login-footer">
          {isRegistering ? "Déjà un compte ? " : "Pas encore de compte ? "}
          <span onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Se connecter" : "S'inscrire"}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
