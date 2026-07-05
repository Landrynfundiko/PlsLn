import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Conexion from './pages/Conexion'
import AdminLayout from './pages/admin/AdminLayout'
import Stats from './pages/admin/Stats'
import StockManagement from './pages/admin/StockManagement'
import Invoicing from './pages/admin/Invoicing'
import SalesHistory from './pages/admin/SalesHistory'
import { useAuth } from './context/AuthContext'

const ADMIN_EMAIL = "landrynfundiko3@gmail.com";

// Écran de chargement pendant la vérification Firebase
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#1A1412',
    color: '#FDFCF0'
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(199, 206, 105, 0.1)',
        borderTop: '3px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span>Authentification en cours...</span>
    </div>
  </div>
);

// Protège les routes admin — redirige vers /connexion si non authentifié
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  const isAdmin = user && user.email === ADMIN_EMAIL;
  if (!isAdmin) return <Navigate to="/connexion" replace />;

  return children;
};

// Redirige la racine selon l'état de connexion
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user && user.email === ADMIN_EMAIL) {
    return <Navigate to="/admin/stats" replace />;
  }

  return <Navigate to="/connexion" replace />;
};

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Racine */}
        <Route path="/" element={<RootRedirect />} />

        {/* Connexion — si déjà connecté, redirige vers admin */}
        <Route path="/connexion" element={<PublicRoute><Conexion /></PublicRoute>} />

        {/* Espace Administration */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/stats" replace />} />
          <Route path="stats" element={<Stats />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="facturation" element={<Invoicing />} />
          <Route path="historique" element={<SalesHistory />} />
        </Route>

        {/* Toute route inconnue → redirection intelligente */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </div>
  );
}

// Redirige un utilisateur déjà connecté vers /admin/stats s'il tente d'aller sur /connexion
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user && user.email === ADMIN_EMAIL) {
    return <Navigate to="/admin/stats" replace />;
  }

  return children;
};

export default App;
