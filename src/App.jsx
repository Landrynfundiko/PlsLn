import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Corps from './pages/boutique/Corps'
import Navbar from './pages/Navbar'
import Pieds from './pages/Pieds'
import Gestpub from './pages/boutique/Gestpub'
import Btq from './pages/boutique/btq'
import CmdCard from './pages/boutique/CmdCard'
import Conexion from './pages/Conexion'
import Cart from './pages/boutique/cart'
import { CartProvider } from './context/CartContext'
import AdminLayout from './pages/admin/AdminLayout'
import StockManagement from './pages/admin/StockManagement'
import Invoicing from './pages/admin/Invoicing'
import { Navigate } from 'react-router-dom'
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
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>Chargement...</div>;
  }

  const isAdmin = user && user.email === "landrynfundiko3@gmail.com";

  if (!isAdmin) {
    return <Navigate to="/connexion" />;
  }

  return children;
};

function App() {
  return (
    <CartProvider>
      <Navbar />
      <div className="main-wrapper">
        <Routes>
          <Route path="/" element={
            <>
              <Corps />
              <Btq />
              <Gestpub />
            </>
          } />
          <Route path="/product/:id" element={<CmdCard />} />
          <Route path="/connexion" element={<Conexion />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/stock" />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="facturation" element={<Invoicing />} />
          </Route>
        </Routes>
      </div>
      <Pieds />
    </CartProvider>
  )
}

export default App
