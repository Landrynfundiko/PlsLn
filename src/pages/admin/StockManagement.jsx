import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot
} from 'firebase/firestore';
import { Plus, Search, Edit2, Trash2, X, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function StockManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // New product form state
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        stock: 0,
        image: null
    });

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

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewProduct({ ...newProduct, image: e.target.files[0] });
        }
    };

    // Compresse et convertit un fichier image en chaîne Base64
    const toBase64Compressed = (file, maxWidth = 800, quality = 0.8) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.image) {
            toast.error("Veuillez sélectionner une image");
            return;
        }

        setIsUploading(true);
        try {
            // Convertir l'image en Base64 pour la stocker dans Firestore
            const imageBase64 = await toBase64Compressed(newProduct.image);

            const productData = {
                name: newProduct.name,
                price: newProduct.price + " USD",
                category: newProduct.category,
                description: newProduct.description,
                stock: parseInt(newProduct.stock),
                image: imageBase64, // Stocke l'image directement en Base64
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, "products"), productData);

            toast.success("Produit ajouté avec succès !");
            setShowAddModal(false);
            setNewProduct({ name: '', price: '', category: '', description: '', stock: 0, image: null });
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error(`Erreur: ${error.message || "Erreur lors de l'ajout du produit"}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
            try {
                await deleteDoc(doc(db, "products", id));
                toast.success("Produit supprimé");
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const handleUpdateStock = async (id, newStock) => {
        try {
            await updateDoc(doc(db, "products", id), {
                stock: parseInt(newStock)
            });
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du stock");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="stock-header">
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '8px' }}>Gestion de Stock</h2>
                    <p style={{ color: '#94a3b8' }}>Gérez votre inventaire et vos produits en temps réel.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        background: 'var(--primary)',
                        color: 'black',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={20} />
                    Ajouter un produit
                </button>
            </div>

            <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 48px',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '16px' }}>Produit</th>
                                    <th style={{ padding: '16px' }}>Catégorie</th>
                                    <th style={{ padding: '16px' }}>Prix</th>
                                    <th style={{ padding: '16px' }}>Stock</th>
                                    <th style={{ padding: '16px' }}>Status</th>
                                    <th style={{ padding: '16px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                                <span style={{ fontWeight: '500' }}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: '#94a3b8' }}>{product.category}</td>
                                        <td style={{ padding: '16px', fontWeight: '600' }}>{product.price}</td>
                                        <td style={{ padding: '16px' }}>
                                            <input
                                                type="number"
                                                value={product.stock}
                                                onChange={(e) => handleUpdateStock(product.id, e.target.value)}
                                                style={{
                                                    width: '60px',
                                                    padding: '4px 8px',
                                                    background: '#0f172a',
                                                    border: '1px solid #334155',
                                                    borderRadius: '6px',
                                                    color: 'white'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: product.stock > 10 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: product.stock > 10 ? '#22c55e' : '#ef4444'
                                            }}>
                                                {product.stock > 10 ? 'En stock' : 'Stock faible'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            Aucun produit trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: '#1e293b',
                                borderRadius: '24px',
                                padding: '32px',
                                width: '100%',
                                maxWidth: '600px',
                                border: '1px solid #334155',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Ajouter un produit</h3>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-grid-2">
                                    <div className="input-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Nom du produit</label>
                                        <input
                                            required
                                            className="styled-input"
                                            value={newProduct.name}
                                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                            placeholder="Ex: Nike Air Max"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Catégorie</label>
                                        <input
                                            required
                                            className="styled-input"
                                            value={newProduct.category}
                                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                            placeholder="Ex: Chaussures"
                                        />
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="input-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Prix (USD)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            className="styled-input"
                                            value={newProduct.price}
                                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Quantité en stock</label>
                                        <input
                                            required
                                            type="number"
                                            className="styled-input"
                                            value={newProduct.stock}
                                            onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Description</label>
                                    <textarea
                                        required
                                        className="styled-input"
                                        rows="3"
                                        value={newProduct.description}
                                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                        placeholder="Description du produit..."
                                        style={{ resize: 'none' }}
                                    />
                                </div>

                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Image du produit</label>
                                    <div style={{
                                        border: '2px dashed #334155',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        background: newProduct.image ? 'rgba(34, 211, 238, 0.05)' : 'transparent'
                                    }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                        />
                                        {newProduct.image ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <p style={{ color: 'var(--primary)', fontWeight: '600' }}>{newProduct.image.name}</p>
                                                <button type="button" onClick={() => setNewProduct({ ...newProduct, image: null })} style={{ background: 'transparent', border: 'none', color: '#ef4444' }}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ color: '#64748b' }}>
                                                <Upload size={24} style={{ marginBottom: '8px' }} />
                                                <p>Cliquez ou glissez une image ici</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    style={{
                                        marginTop: '12px',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'var(--primary)',
                                        color: 'black',
                                        border: 'none',
                                        fontWeight: '700',
                                        cursor: isUploading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Envoi en cours...
                                        </>
                                    ) : 'Ajouter le produit'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

