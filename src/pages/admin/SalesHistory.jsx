import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Search, Loader2, Trash2, Edit2, X, Download, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function SalesHistory() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingSale, setEditingSale] = useState(null);
    const [editForm, setEditForm] = useState({ customerName: '', total: 0 });
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "salesHistory"), (snapshot) => {
            const salesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side safely with extreme fallbacks
            salesList.sort((a, b) => {
                const getTime = (val) => {
                    if (!val) return 0;
                    const parsed = new Date(val).getTime();
                    return isNaN(parsed) ? 0 : parsed;
                };
                return getTime(b.date) - getTime(a.date);
            });

            setSales(salesList);
            setLoading(false);
        }, (error) => {
            console.error("Firestore error in SalesHistory:", error);
            toast.error("Erreur de chargement de l'historique");
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleDeleteSale = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cet enregistrement de vente ?")) {
            try {
                await deleteDoc(doc(db, "salesHistory", id));
                toast.success("Vente supprimée de l'historique");
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const handleEditClick = (sale) => {
        setEditingSale(sale);
        setEditForm({ customerName: sale.customerName, total: sale.total });
    };

    const handleUpdateSale = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, "salesHistory", editingSale.id), {
                customerName: editForm.customerName,
                total: parseFloat(editForm.total)
            });
            toast.success("Vente mise à jour avec succès");
            setEditingSale(null);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleDownloadHistoryPDF = async () => {
        const element = document.getElementById('sales-history-table');
        if (!element || sales.length === 0) {
            toast.error("Aucune donnée à exporter");
            return;
        }

        try {
            setIsDownloading(true);
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#0f0f1a' // Correspond au fond de l'admin
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = canvas.width / 2;
            const pdfHeight = canvas.height / 2;

            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'l' : 'p',
                unit: 'pt',
                format: [pdfWidth, pdfHeight]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Historique-Ventes_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);

            toast.success("Historique téléchargé !");
        } catch (error) {
            console.error("Erreur PDF:", error);
            toast.error("Échec de la génération du PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    const filteredSales = sales.filter(s =>
        s.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-stock-page">
            <div className="stock-header">
                <div className="stock-title-section">
                    <h2 className="admin-page-title">Historique des Ventes</h2>
                    <p className="admin-page-subtitle">Consultez et gérez l'historique de vos ventes.</p>
                </div>
                <button
                    onClick={handleDownloadHistoryPDF}
                    disabled={isDownloading || sales.length === 0}
                    className="admin-btn-primary"
                    style={{ background: 'var(--primary)', color: 'black' }}
                >
                    {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                    <span>{isDownloading ? 'Génération PDF...' : 'Exporter en PDF'}</span>
                </button>
            </div>

            <div className="admin-table-container">
                <div className="admin-search-container">
                    <Search size={20} className="admin-search-icon" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom du client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                    </div>
                ) : (
                    <div className="admin-table-wrapper" id="sales-history-table" style={{ padding: '20px', background: 'var(--admin-card-bg)', borderRadius: '12px' }}>
                        <div className="pdf-header" style={{ display: isDownloading ? 'block' : 'none', marginBottom: '20px', textAlign: 'center' }}>
                            <h2 style={{ color: 'white' }}>Rapport des Ventes PLS STORE</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Généré le {new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Client</th>
                                    <th>Articles</th>
                                    <th>Total ($)</th>
                                    <th className="no-print" style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {(() => {
                                                if (!sale.date) return 'Date inconnue';
                                                const d = new Date(sale.date);
                                                return isNaN(d.getTime()) ? String(sale.date) : d.toLocaleString('fr-FR');
                                            })()}
                                        </td>
                                        <td style={{ fontWeight: '500', color: 'white' }}>{String(sale.customerName || 'Client Inconnu')}</td>
                                        <td>
                                            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {(() => {
                                                    if (!sale.items) return <li>Aucun détail</li>;
                                                    if (!Array.isArray(sale.items)) return <li>{String(sale.items)}</li>;
                                                    if (sale.items.length === 0) return <li>Vide</li>;

                                                    return sale.items.map((item, idx) => {
                                                        if (typeof item === 'object' && item !== null) {
                                                            return <li key={idx}>{item.quantity || 1}x {item.name || 'Produit sans nom'}</li>;
                                                        }
                                                        return <li key={idx}>{String(item)}</li>;
                                                    });
                                                })()}
                                            </ul>
                                        </td>
                                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                            {(() => {
                                                const num = Number(sale.total);
                                                return isNaN(num) ? '0.00' : num.toFixed(2);
                                            })()} $
                                        </td>
                                        <td className="no-print">
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleEditClick(sale)}
                                                    style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}
                                                    className="action-btn-edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSale(sale.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}
                                                    className="action-btn-danger"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSales.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            Aucune vente trouvée.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal d'édition */}
            <AnimatePresence>
                {editingSale && (
                    <div className="admin-modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="admin-modal-content"
                        >
                            <div className="admin-modal-header">
                                <h3 className="admin-modal-title">Modifier la vente</h3>
                                <button onClick={() => setEditingSale(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateSale} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div className="admin-form-group">
                                    <label className="admin-label">Nom du client</label>
                                    <input
                                        required
                                        className="styled-input"
                                        value={editForm.customerName}
                                        onChange={e => setEditForm({ ...editForm, customerName: e.target.value })}
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-label">Total ($)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="styled-input"
                                        value={editForm.total}
                                        onChange={e => setEditForm({ ...editForm, total: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="admin-btn-primary"
                                    style={{ padding: '16px', fontSize: '1rem' }}
                                >
                                    Enregistrer les modifications
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .action-btn-edit:hover {
                    background: rgba(59, 130, 246, 0.1);
                }
                .action-btn-danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
                @media print, (max-width: 768px) {
                    .no-print {
                        display: none !important;
                    }
                }
                #sales-history-table {
                    background-color: #0f0f1a; /* bg de la zone d'impression */
                }
            `}</style>
        </div>
    );
}
