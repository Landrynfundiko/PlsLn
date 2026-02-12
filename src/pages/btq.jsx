import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

// Import images
import af1 from '../assets/AF1.PNG';
import dn from '../assets/DN.PNG';
import dn2 from '../assets/DN2.JPG';
import tn from '../assets/TN.JPG';
import cactus from '../assets/cactus.AVIF';
import cpus from '../assets/cpus.JPG';
import nike from '../assets/nike.AVIF';
import rnt from '../assets/rnt ch.WEBP';

const products = [
    { id: 1, name: 'Nike Air Force 1', price: '18,9 USD', image: af1, category: 'Nike' },
    { id: 2, name: 'Nike DN Black', price: '19,3 USD', image: dn, category: 'Nike' },
    { id: 3, name: 'Nike DN Special', price: '19,3 USD', image: dn2, category: 'Nike' },
    { id: 4, name: 'Nike TN 2019', price: '20,6 USD', image: tn, category: 'Nike' },
    { id: 5, name: 'Cactus Jack', price: '20,9 USD', image: cactus, category: 'Travis Scott' },
    { id: 6, name: 'Campus 00s', price: '19,3 USD', image: cpus, category: 'Adidas' },
    { id: 7, name: 'Nike AF1', price: '18,3 USD', image: nike, category: 'Nike' },
    { id: 8, name: 'Renato dulbeecc', price: '19,6 USD', image: rnt, category: 'Converse' },
];

const ProductCard = ({ product }) => {
    return (
        <motion.div
            className="product-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -10 }}
        >
            <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-overlay">
                    <motion.a
                        href={`https://wa.me/243981401138?text=Bonjour, je suis intéressé par la paire : ${product.name} à ${product.price}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaWhatsapp size={20} />
                        Commander
                    </motion.a>
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
    return (
        <section className="btq-section">
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
                    Découvrez nos modèles exclusifs et commandez directement sur WhatsApp.
                </motion.p>
            </div>

            <div className="products-grid">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default Btq;
