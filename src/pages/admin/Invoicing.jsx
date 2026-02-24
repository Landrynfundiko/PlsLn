import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Plus, Trash2, Printer, Download, CreditCard, User, Loader2 } from 'lucide-react';
import Receipt from './Receipt';

export default function Invoicing() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);

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
                    onClick={() => setShowReceipt(false)}
                    style={{ marginBottom: '20px', padding: '10px 20px', borderRadius: '8px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Retour à la facturation
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
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '8px' }}>Nouvelle Facture</h2>
                <p style={{ color: '#94a3b8' }}>Générez des reçus professionnels pour vos clients.</p>
            </div>

            <div className="invoice-grid">
                <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.875rem' }}>Nom du client</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="Ex: aganze landry"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 48px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Articles</h3>
                            <button
                                onClick={addItem}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                            >
                                <Plus size={18} /> Ajouter
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {items.map((item, index) => (
                                <div key={index} className="invoice-item-row">
                                    <select
                                        value={item.productId}
                                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                        style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }}
                                    >
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                        style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }}
                                    />
                                    <div style={{ textAlign: 'right', fontWeight: '600' }}>
                                        {products.find(p => p.id === item.productId) ? (parseFloat(products.find(p => p.id === item.productId).price.replace(',', '.').split(' ')[0]) * item.quantity).toFixed(2) : '0.00'} $
                                    </div>
                                    <button
                                        onClick={() => removeItem(index)}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '32px', border: '2px dashed #334155', borderRadius: '12px', color: '#64748b' }}>
                                    Aucun article ajouté.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '20px' }}>Résumé</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                <span>Sous-total</span>
                                <span>{calculateTotal()} $</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                <span>Taxe (0%)</span>
                                <span>0.00 $</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '12px', fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                <span>Total</span>
                                <span>{calculateTotal()} $</span>
                            </div>
                        </div>
                        <button
                            disabled={items.length === 0 || !customerName}
                            onClick={() => setShowReceipt(true)}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: 'var(--primary)',
                                color: 'black',
                                border: 'none',
                                fontWeight: '700',
                                cursor: items.length === 0 || !customerName ? 'not-allowed' : 'pointer',
                                opacity: items.length === 0 || !customerName ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Printer size={20} />
                            Générer le reçu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

