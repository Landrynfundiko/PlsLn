import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../config/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { Search, Loader2, Trash2, Edit2, X, Download, FileText, Archive } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const getWeekStartDate = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
        return null;
    }
    const day = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getWeekEndDate = (weekStart) => {
    if (!weekStart) return null;
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
};

const getWeekId = (date) => {
    const weekStart = getWeekStartDate(date);
    if (!weekStart) return '';
    return weekStart.toISOString().slice(0, 10);
};

const formatWeekLabel = (weekId) => {
    if (!weekId) return 'Semaine inconnue';
    const start = new Date(`${weekId}T00:00:00.000Z`);
    const end = getWeekEndDate(start);
    const startLabel = start.toLocaleDateString('fr-FR');
    const endLabel = end.toLocaleDateString('fr-FR');
    return `${startLabel} → ${endLabel}`;
};

const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

export default function SalesHistory() {
    const [sales, setSales] = useState([]);
    const [archivedSales, setArchivedSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingSale, setEditingSale] = useState(null);
    const [editForm, setEditForm] = useState({ customerName: '', total: 0 });
    const [isDownloading, setIsDownloading] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [selectedWeekId, setSelectedWeekId] = useState(getWeekId(new Date()));

    const currentWeekId = getWeekId(new Date());
    const currentWeekStart = getWeekStartDate(new Date());

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'salesHistory'), (snapshot) => {
            const salesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

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
            console.error('Firestore error in SalesHistory:', error);
            toast.error("Erreur de chargement de l'historique");
            setLoading(false);
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'salesArchive'), (snapshot) => {
            const archiveList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            archiveList.sort((a, b) => {
                const getTime = (val) => {
                    if (!val) return 0;
                    const parsed = new Date(val).getTime();
                    return isNaN(parsed) ? 0 : parsed;
                };
                return getTime(b.date) - getTime(a.date);
            });

            setArchivedSales(archiveList);
        }, (error) => {
            console.error('Firestore error in SalesArchive:', error);
            toast.error("Erreur de chargement des archives de ventes");
        });

        return () => unsub();
    }, []);

    const pastSalesToArchive = sales.filter(s => {
        if (!s.date) return false;
        const saleDate = new Date(s.date);
        return saleDate.getTime() < currentWeekStart.getTime();
    });

    const archivedWeekIds = useMemo(() => Array.from(new Set(archivedSales
        .map(sale => sale.archivedWeekId)
        .filter(Boolean)
    )).sort((a, b) => b.localeCompare(a)), [archivedSales]);

    const availableWeekIds = useMemo(() => [currentWeekId, ...archivedWeekIds], [currentWeekId, archivedWeekIds]);

    useEffect(() => {
        if (!availableWeekIds.includes(selectedWeekId)) {
            setSelectedWeekId(currentWeekId);
        }
    }, [availableWeekIds, selectedWeekId, currentWeekId]);

    const currentWeekSales = sales.filter(sale => getWeekId(sale.date) === currentWeekId);
    const archivedWeekSales = archivedSales.filter(sale => sale.archivedWeekId === selectedWeekId);
    const displayedSales = selectedWeekId === currentWeekId ? currentWeekSales : archivedWeekSales;

    const filteredSales = displayedSales.filter(sale =>
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteSale = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cet enregistrement de vente ?")) {
            try {
                await deleteDoc(doc(db, 'salesHistory', id));
                toast.success('Vente supprimée de l\'historique');
            } catch {
                toast.error('Erreur lors de la suppression');
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
            await updateDoc(doc(db, 'salesHistory', editingSale.id), {
                customerName: editForm.customerName,
                total: parseFloat(editForm.total)
            });
            toast.success('Vente mise à jour avec succès');
            setEditingSale(null);
        } catch {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const exportSales = filteredSales;
    const exportWeekLabel = selectedWeekId === currentWeekId ? `Semaine en cours (${formatWeekLabel(currentWeekId)})` : `Semaine archivée (${formatWeekLabel(selectedWeekId)})`;

    const handleDownloadHistoryPDF = () => {
        if (exportSales.length === 0) {
            toast.error('Aucune donnée à exporter');
            return;
        }

        try {
            setIsDownloading(true);

            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

            pdf.setFillColor(26, 20, 18);
            pdf.rect(0, 0, pageW, 28, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.setTextColor(199, 206, 105);
            pdf.text('PLS STORE', margin, 17);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(166, 159, 136);
            pdf.text('RAPPORT D\'HISTORIQUE DES VENTES', pageW - margin, 12, { align: 'right' });
            pdf.text(`Généré le ${today}`, pageW - margin, 19, { align: 'right' });
            pdf.setFillColor(45, 32, 24);
            pdf.rect(0, 28, pageW, 18, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.setTextColor(255, 255, 255);
            pdf.text(`Période : ${exportWeekLabel}`, margin, 37);
            const totalCA = exportSales.reduce((s, v) => s + (Number(v.total) || 0), 0);
            const totalVentes = exportSales.length;
            pdf.text(`Nombre de ventes : ${totalVentes}`, margin, 44);
            pdf.text(`Chiffre d'affaires total : ${totalCA.toFixed(2)} USD`, margin + 90, 44);

            let y = 55;
            const colWidths = [38, 48, 52, 115, 25];
            const colX = [margin];
            for (let i = 0; i < colWidths.length - 1; i++) {
                colX.push(colX[i] + colWidths[i]);
            }
            const headers = ['Date', 'Client', 'Total (USD)', 'Articles vendus', '#'];

            const drawTableHeader = () => {
                pdf.setFillColor(26, 20, 18);
                pdf.rect(margin, y - 6, pageW - margin * 2, 10, 'F');
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                pdf.setTextColor(199, 206, 105);
                headers.forEach((h, i) => {
                    pdf.text(h, colX[i] + 2, y);
                });
                y += 5;
                pdf.setDrawColor(199, 206, 105);
                pdf.setLineWidth(0.3);
                pdf.line(margin, y, pageW - margin, y);
                y += 4;
            };

            drawTableHeader();
            let rowIndex = 0;

            for (const sale of exportSales) {
                const itemsText = sale.items?.map(i => `${i.quantity}x ${i.name}`).join(', ') || '-';
                const wrappedItems = pdf.splitTextToSize(itemsText, colWidths[3] - 4);
                const rowH = Math.max(7, wrappedItems.length * 4.5 + 3);
                if (y + rowH > pageH - 20) {
                    pdf.addPage();
                    pdf.setFillColor(26, 20, 18);
                    pdf.rect(0, 0, pageW, 28, 'F');
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(16);
                    pdf.setTextColor(199, 206, 105);
                    pdf.text('PLS STORE', margin, 17);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(9);
                    pdf.setTextColor(166, 159, 136);
                    pdf.text(`Suite - page ${pdf.internal.getNumberOfPages()}`, pageW - margin, 19, { align: 'right' });
                    y = 42;
                    drawTableHeader();
                }
                if (rowIndex % 2 === 0) {
                    pdf.setFillColor(248, 248, 248);
                    pdf.rect(margin, y - 4, pageW - margin * 2, rowH, 'F');
                }
                const dateStr = sale.date ? new Date(sale.date).toLocaleDateString('fr-FR') : '-';
                const clientStr = sale.customerName || 'Client Inconnu';
                const totalStr = `${(Number(sale.total) || 0).toFixed(2)} $`;
                const numStr = String(rowIndex + 1);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.setTextColor(40, 40, 40);
                pdf.text(dateStr, colX[0] + 2, y + 1);
                pdf.text(pdf.splitTextToSize(clientStr, colWidths[1] - 4), colX[1] + 2, y + 1);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(130, 100, 20);
                pdf.text(totalStr, colX[2] + 2, y + 1);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(40, 40, 40);
                pdf.text(wrappedItems, colX[3] + 2, y + 1);
                pdf.setTextColor(140, 140, 140);
                pdf.text(numStr, colX[4] + 2, y + 1);
                pdf.setDrawColor(220, 220, 220);
                pdf.setLineWidth(0.1);
                pdf.line(margin, y + rowH - 2, pageW - margin, y + rowH - 2);
                y += rowH;
                rowIndex++;
            }

            const footerY = pageH - 8;
            pdf.setFontSize(7);
            pdf.setTextColor(160, 160, 160);
            pdf.text(`PLS STORE — Rapport confidentiel généré le ${today}`, margin, footerY);
            pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageW - margin, footerY, { align: 'right' });

            const filename = `Historique-Ventes_PLS_${selectedWeekId}.pdf`;
            pdf.save(filename);
            toast.success('Rapport PDF téléchargé avec succès !');
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            toast.error('Échec de la génération du PDF.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadHistoryCSV = () => {
        if (exportSales.length === 0) {
            toast.error('Aucune donnée à exporter');
            return;
        }

        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Date,Client,Articles,Total (USD)\n';

        exportSales.forEach(sale => {
            const dateStr = sale.date ? new Date(sale.date).toLocaleString('fr-FR').replace(',', '') : 'Inconnue';
            const client = sale.customerName?.replace(/"/g, '""') || 'Client Inconnu';
            const itemsList = sale.items?.map(i => `${i.quantity}x ${i.name}`).join(' | ').replace(/"/g, '""') || '';
            const total = sale.total || 0;
            csvContent += `"${dateStr}","${client}","${itemsList}",${total}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Historique-Ventes_PLS_${selectedWeekId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Historique des ventes CSV téléchargé !');
    };

    const handleArchivePastWeeks = async () => {
        if (pastSalesToArchive.length === 0) {
            toast.info('Aucune vente rétroactive à archiver.');
            return;
        }

        const confirmArchive = window.confirm('Archiver toutes les ventes antérieures à la semaine en cours vers les archives ?');
        if (!confirmArchive) return;

        setArchiving(true);

        try {
            const chunks = chunkArray(pastSalesToArchive, 200);
            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach(sale => {
                    const weekId = getWeekId(sale.date);
                    const saleRef = doc(db, 'salesArchive', sale.id);
                    batch.set(saleRef, {
                        ...sale,
                        archivedWeekId: weekId,
                        archivedWeekStart: getWeekStartDate(sale.date).toISOString(),
                        archivedWeekEnd: getWeekEndDate(getWeekStartDate(sale.date)).toISOString(),
                        archivedAt: new Date().toISOString()
                    });
                    batch.delete(doc(db, 'salesHistory', sale.id));
                });
                await batch.commit();
            }
            toast.success(`${pastSalesToArchive.length} vente(s) archivées avec succès.`);
        } catch (error) {
            console.error('Erreur d\'archivage :', error);
            toast.error('Erreur lors de l\'archivage des ventes.');
        } finally {
            setArchiving(false);
        }
    };

    const hasOldSalesToArchive = pastSalesToArchive.length > 0;

    return (
        <div className="admin-stock-page">
            <div className="stock-header" style={{ gap: '12px', flexWrap: 'wrap' }}>
                <div className="stock-title-section" style={{ minWidth: '280px' }}>
                    <h2 className="admin-page-title">Historique des Ventes</h2>
                    <p className="admin-page-subtitle">Consultez et gérez l'historique de vos ventes par semaine.</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label htmlFor="week-select" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Semaine :</label>
                        <select
                            id="week-select"
                            value={selectedWeekId}
                            onChange={(e) => setSelectedWeekId(e.target.value)}
                            style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                        >
                            <option value={currentWeekId}>Cette semaine — {formatWeekLabel(currentWeekId)}</option>
                            {archivedWeekIds.map((weekId) => (
                                <option key={weekId} value={weekId}>{formatWeekLabel(weekId)}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleArchivePastWeeks}
                        disabled={!hasOldSalesToArchive || archiving}
                        className="admin-btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1d4ed8', color: 'white' }}
                    >
                        {archiving ? <Loader2 className="animate-spin" size={20} /> : <Archive size={20} />}
                        <span>{archiving ? 'Archivage...' : 'Archiver semaine passée'}</span>
                    </button>

                    <button
                        onClick={handleDownloadHistoryPDF}
                        disabled={isDownloading || exportSales.length === 0}
                        className="admin-btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'black' }}
                    >
                        {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        <span>{isDownloading ? 'Génération PDF...' : 'Télécharger PDF'}</span>
                    </button>

                    <button
                        onClick={handleDownloadHistoryCSV}
                        disabled={exportSales.length === 0}
                        className="admin-btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', color: 'var(--text)' }}
                    >
                        <FileText size={20} />
                        <span>Télécharger CSV</span>
                    </button>
                </div>
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
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Période sélectionnée :</p>
                                <strong>{selectedWeekId === currentWeekId ? `Cette semaine (${formatWeekLabel(currentWeekId)})` : formatWeekLabel(selectedWeekId)}</strong>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ventes dans cette période</p>
                                <strong>{exportSales.length}</strong>
                            </div>
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
                                        <td style={{ fontWeight: '500', color: 'var(--text)' }}>{String(sale.customerName || 'Client Inconnu')}</td>
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
                                                {selectedWeekId === currentWeekId && (
                                                    <button
                                                        onClick={() => handleEditClick(sale)}
                                                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}
                                                        className="action-btn-edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}
                                                {selectedWeekId === currentWeekId && (
                                                    <button
                                                        onClick={() => handleDeleteSale(sale.id)}
                                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}
                                                        className="action-btn-danger"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
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

            <AnimatePresence>
                {editingSale && selectedWeekId === currentWeekId && (
                    <div className="admin-modal-overlay">
                        <Motion.div
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
                        </Motion.div>
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
                    background-color: #0f0f1a;
                }
            `}</style>
        </div>
    );
}
