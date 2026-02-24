import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaArrowLeft } from 'react-icons/fa';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { onAuthStateChanged } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';

export default function CmdCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check auth
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Fetch product
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Fallback check if ID was numeric in Firestore for some reason
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => unsubscribeAuth();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Produit non trouvé</div>
        <button onClick={() => navigate('/')} className="back-nav-btn" style={{ position: 'static', marginTop: '20px' }}>
          <FaArrowLeft /> Retour à la boutique
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour ajouter des articles au panier");
      setTimeout(() => navigate('/connexion'), 1500);
      return;
    }

    // Ensure price is numeric for the context
    const numericPrice = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[^0-9.]/g, ''))
      : product.price;

    addToCart({
      ...product,
      prix: numericPrice
    });

    toast.success(`${product.name} ajouté au panier !`);
  };

  return (
    <div className="product-detail-container">
      <Toaster position="top-right" />
      <button onClick={() => navigate('/')} className="back-nav-btn">
        <FaArrowLeft /> Retour
      </button>

      <div className="product-detail-content">
        {/* Left Side: Image */}
        <motion.div
          className="product-detail-image-wrapper"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={product.image} alt={product.name} className="product-detail-image" />
        </motion.div>

        {/* Right Side: Info */}
        <motion.div
          className="product-detail-info"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="product-detail-category">{product.category}</span>
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-price">{product.price}</p>

          <div className="product-detail-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-actions" style={{ width: '100%' }}>
            <button onClick={handleAddToCart} className="order-btn-large">
              <ShoppingCart size={24} style={{ marginRight: '10px' }} />
              Ajouter au panier
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
