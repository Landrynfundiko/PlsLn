import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaWhatsapp, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            className="product-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: 'pointer' }}
        >
            <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-overlay">
                    <motion.button
                        className="whatsapp-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                        }}
                    >
                        <FaEye size={20} />
                        Voir détails
                    </motion.button>
                </div>
            </div>
            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{product.price}</p>
            </div>
        </motion.div>
    );
};

const Btq = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const productList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productList);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', color: 'white' }}>
                Chargement des produits...
            </div>
        );
    }

    return (
        <section id="boutique" className="btq-section">
            <div className="btq-header">
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Nos Collections
                </motion.h2>
                <motion.p
                    className="section-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    Découvrez nos modèles exclusifs et cliquez pour voir les détails.
                </motion.p>
            </div>

            <div className="products-grid">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                {products.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Aucun produit disponible pour le moment.
                    </div>
                )}
            </div>
        </section>
    );
};

export default Btq;
