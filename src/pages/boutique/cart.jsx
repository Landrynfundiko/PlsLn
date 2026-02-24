import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (cartItems.length === 0) return;

        let message = "Bonjour PLS STORE ! Je souhaite passer une commande :\n\n";
        cartItems.forEach((item, index) => {
            message += `${index + 1}. *${item.name}* (${item.category})\n`;
            message += `   Quantité : ${item.quantity}\n`;
            message += `   Prix : ${item.prix} USD\n\n`;
        });
        message += `*Total : ${cartTotal.toFixed(2)} USD*\n\n`;
        message += "Merci de me confirmer la disponibilité et les modalités de paiement.";

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/243981401138?text=${encodedMessage}`, '_blank');
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-container empty">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="empty-cart-content"
                >
                    <div className="empty-icon-wrapper">
                        <ShoppingBag size={64} />
                    </div>
                    <h1>Votre panier est vide</h1>
                    <p>On dirait que vous n'avez pas encore ajouté de produits à votre panier.</p>
                    <button onClick={() => navigate('/')} className="back-to-shop-btn">
                        <FaArrowLeft /> Retourner à la boutique
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-header">
                <button onClick={() => navigate('/')} className="back-nav-btn" style={{ position: 'static' }}>
                    <FaArrowLeft /> boutique
                </button>
                <h1>Mon Panier</h1>
                <button onClick={clearCart} className="clear-cart-btn">
                    Vider le panier
                </button>
            </div>

            <div className="cart-grid">
                <div className="cart-items-list">
                    <AnimatePresence mode="popLayout">
                        {cartItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="cart-item-card"
                            >
                                <div className="cart-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="cart-item-info">
                                    <span className="item-category">{item.category}</span>
                                    <h3>{item.name}</h3>
                                    <p className="item-price-unit">{item.prix} USD / unité</p>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                            <FaMinus size={12} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                            <FaPlus size={12} />
                                        </button>
                                    </div>
                                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="cart-summary-card"
                >
                    <h2>Résumé de la commande</h2>
                    <div className="summary-row">
                        <span>Produits ({cartItems.length})</span>
                        <span>{cartTotal.toFixed(2)} USD</span>
                    </div>
                    <div className="summary-row">
                        <span>Livraison</span>
                        <span className="free">Gratuite</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>{cartTotal.toFixed(2)} USD</span>
                    </div>

                    <button onClick={handleCheckout} className="checkout-btn">
                        <FaWhatsapp size={20} />
                        Commander sur WhatsApp
                    </button>

                    <p className="summary-note">
                        En cliquant sur commander, vous serez redirigé vers WhatsApp pour finaliser l'achat avec un conseiller.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
