import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2, Printer, Download, CreditCard, User, Loader2 } from 'lucide-react';
import Receipt from './Receipt';

export default function Invoicing() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
            const productList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productList);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const addItem = () => {
        if (products.length > 0) {
            setItems([...items, { productId: products[0].id, quantity: 1 }]);
        }
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return total;
            const price = parseFloat(product.price.replace(',', '.').split(' ')[0]);
            return total + (price * item.quantity);
        }, 0).toFixed(2);
    };

    const handleGenerateReceipt = async () => {
        setIsSaving(true);
        try {
            const saleData = {
                customerName: customerName,
                items: items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return {
                        productId: item.productId,
                        name: product?.name || 'Produit inconnu',
                        quantity: item.quantity,
                        unitPrice: product ? parseFloat(product.price.replace(',', '.').split(' ')[0]) : 0
                    };
                }),
                total: parseFloat(calculateTotal()),
                date: new Date().toISOString()
            };

            await addDoc(collection(db, "salesHistory"), saleData);
            setShowReceipt(true);
        } catch (error) {
            console.error("Erreur d'enregistrement de la vente:", error);
            // On peut afficher le reçu quand même ou gérer l'erreur
            setShowReceipt(true);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            </div>
        );
    }

    if (showReceipt) {
        return (
            <div style={{ padding: '20px' }}>
                <button
                    onClick={() => {
                        setShowReceipt(false);
                        setCustomerName('');
                        setItems([]);
                    }}
                    style={{ marginBottom: '20px', padding: '10px 20px', borderRadius: '8px', background: 'var(--border)', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Retour à la facturation (Nouvelle vente)
                </button>
                <Receipt
                    customerName={customerName}
                    items={items.map(item => ({
                        ...products.find(p => p.id === item.productId),
                        quantity: item.quantity
                    }))}
                    total={calculateTotal()}
                />
            </div>
        );
    }

    return (
        <div className="admin-invoice-page">
            <div className="invoice-header-section">
                <h2 className="admin-page-title">Nouvelle Facture</h2>
                <p className="admin-page-subtitle">Générez des reçus professionnels pour vos clients.</p>
            </div>

            <div className="invoice-grid">
                <div className="admin-card invoice-main-card">
                    <div className="admin-form-group" style={{ marginBottom: '24px' }}>
                        <label className="admin-label">Nom du client</label>
                        <div className="admin-search-container" style={{ margin: 0 }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Ex: aganze landry"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="admin-search-input"
                            />
                        </div>
                    </div>

                    <div className="invoice-items-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Articles</h3>
                            <button
                                onClick={addItem}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                            >
                                <Plus size={18} /> Ajouter
                            </button>
                        </div>

                        <div className="invoice-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map((item, index) => (
                                <div key={index} className="invoice-item-row admin-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                                    <div className="admin-form-group">
                                        <label className="admin-label mobile-only">Article</label>
                                        <select
                                            value={item.productId}
                                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                            style={{ width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white' }}
                                        >
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label mobile-only">Quantité</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                            style={{ width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white' }}
                                        />
                                    </div>
                                    <div className="item-price-total">
                                        <label className="admin-label mobile-only">Total</label>
                                        <div style={{ textAlign: 'right', fontWeight: '600', color: 'white' }}>
                                            {products.find(p => p.id === item.productId) ? (parseFloat(products.find(p => p.id === item.productId).price.replace(',', '.').split(' ')[0]) * item.quantity).toFixed(2) : '0.00'} $
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(index)}
                                        style={{ border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                                    <Plus size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                    <p style={{ margin: 0 }}>Aucun article ajouté.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="invoice-summary-section">
                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px', color: 'white' }}>Résumé</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <span>Sous-total</span>
                                <span style={{ color: 'white', fontWeight: '500' }}>{calculateTotal()} $</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <span>Taxe (0%)</span>
                                <span style={{ color: 'white', fontWeight: '500' }}>0.00 $</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                                <span>Total</span>
                                <span>{calculateTotal()} $</span>
                            </div>
                        </div>
                        <button
                            disabled={items.length === 0 || !customerName || isSaving}
                            onClick={handleGenerateReceipt}
                            className="admin-btn-primary"
                            style={{ width: '100%', padding: '16px' }}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Printer size={20} />}
                            {isSaving ? "Enregistrement..." : "Générer le reçu et sauvegarder"}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .invoice-header-section {
                    margin-bottom: 32px;
                }
                .admin-page-title {
                    font-size: clamp(1.5rem, 5vw, 1.875rem);
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .admin-page-subtitle {
                    color: var(--text-muted);
                    font-size: clamp(0.875rem, 3vw, 1rem);
                }
                .mobile-only {
                    display: none;
                }
                @media (max-width: 768px) {
                    .invoice-grid {
                        grid-template-columns: 1fr;
                    }
                    .mobile-only {
                        display: block;
                    }
                    .invoice-item-row {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                    .item-price-total {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                }
            `}</style>
        </div>
    );
}

