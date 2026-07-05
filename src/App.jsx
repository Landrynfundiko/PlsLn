import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Conexion from './pages/Conexion'
import AdminLayout from './pages/admin/AdminLayout'
import Stats from './pages/admin/Stats'
import StockManagement from './pages/admin/StockManagement'
import Invoicing from './pages/admin/Invoicing'
import SalesHistory from './pages/admin/SalesHistory'
import { auth } from './config/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const AdminRoute = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#1A1412', 
        color: '#FDFCF0' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="admin-spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(199, 206, 105, 0.1)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>Authentification en cours...</span>
        </div>
      </div>
    );
  }

  const isAdmin = user && user.email === "landrynfundiko3@gmail.com";

  if (!isAdmin) {
    return <Navigate to="/connexion" />;
  }

  return children;
};

const RootRedirect = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  if (user && user.email === "landrynfundiko3@gmail.com") {
    return <Navigate to="/admin/stats" />;
  }

  return <Navigate to="/connexion" />;
};

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/connexion" element={<Conexion />} />
        
        {/* Espace Administration */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/stats" />} />
          <Route path="stats" element={<Stats />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="facturation" element={<Invoicing />} />
          <Route path="historique" element={<SalesHistory />} />
        </Route>

        {/* Redirection fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </div>
  );
}

export default App;
