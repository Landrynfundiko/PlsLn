import React, { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function Receipt({ customerName, items, total }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const date = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('printable-receipt');
        if (!element) return;

        try {
            setIsDownloading(true);
            // Sauvegarder la position de défilement pour éviter les coupures
            const originalScrollY = window.scrollY;
            window.scrollTo(0, 0);

            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: document.documentElement.scrollWidth,
                windowHeight: document.documentElement.scrollHeight
            });

            window.scrollTo(0, originalScrollY);

            const imgData = canvas.toDataURL('image/png');

            // Utiliser la dimension exacte du canvas pour correspondre à 100% au reçu
            const pdfWidth = canvas.width / 2;
            const pdfHeight = canvas.height / 2;

            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'l' : 'p',
                unit: 'pt',
                format: [pdfWidth, pdfHeight]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Facture-PLS-STORE-${customerName ? customerName.replace(/\s+/g, '-') : 'Client'}.pdf`);

            toast.success("Facture téléchargée avec succès !");
        } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
            toast.error("Échec de la génération du PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="receipt-container">
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginBottom: '24px', flexWrap: 'wrap' }} className="no-print">
                <button
                    onClick={handlePrint}
                    className="admin-btn-primary"
                    style={{ background: 'var(--primary)', color: 'black' }}
                >
                    <Printer size={18} /> <span>Imprimer</span>
                </button>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="admin-btn-primary"
                    style={{ background: 'var(--border)', color: 'white', opacity: isDownloading ? 0.7 : 1, cursor: isDownloading ? 'not-allowed' : 'pointer' }}
                >
                    <Download size={18} /> <span>{isDownloading ? "Génération..." : "Télécharger PDF"}</span>
                </button>
            </div>

            <div className="receipt-paper" id="printable-receipt">
                <div className="receipt-header">
                    <div>
                        <h1 className="receipt-logo">PLS STORE</h1>
                        <p className="receipt-subtitle">Boutique de Souliers & Accessoires</p>
                    </div>
                    <div className="receipt-meta">
                        <h2 className="receipt-type">FACTURE</h2>
                        <p className="receipt-number">#{Math.floor(Math.random() * 900000) + 100000}</p>
                        <p className="receipt-date">{date}</p>
                    </div>
                </div>

                <div className="receipt-client-vendeur">
                    <div className="receipt-vendeur">
                        <p className="receipt-label">Vendeur</p>
                        <p className="receipt-name">Landry nfundiko</p>
                        <p className="receipt-info">Admin PLS STORE</p>
                    </div>
                    <div className="receipt-client">
                        <p className="receipt-label">Client</p>
                        <p className="receipt-name">{customerName || "Client non spécifié"}</p>
                    </div>
                </div>

                <div className="receipt-table-wrapper">
                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th>ARTICLE</th>
                                <th style={{ textAlign: 'center' }}>QTÉ</th>
                                <th className="desktop-only" style={{ textAlign: 'right' }}>PRIX U.</th>
                                <th style={{ textAlign: 'right' }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const unitPrice = parseFloat(item.price.replace(',', '.').split(' ')[0]);
                                return (
                                    <tr key={index}>
                                        <td style={{ fontWeight: '500' }}>{item.name}</td>
                                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                        <td className="desktop-only" style={{ textAlign: 'right' }}>{unitPrice.toFixed(2)} $</td>
                                        <td style={{ textAlign: 'right', fontWeight: '600' }}>{(unitPrice * item.quantity).toFixed(2)} $</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="receipt-footer-section">
                    <div className="receipt-summary">
                        <div className="receipt-summary-row">
                            <span>Sous-total</span>
                            <span style={{ fontWeight: '500' }}>{total} $</span>
                        </div>
                        <div className="receipt-summary-row">
                            <span>TVA (0%)</span>
                            <span style={{ fontWeight: '500' }}>0.00 $</span>
                        </div>
                        <div className="receipt-summary-row total">
                            <span>TOTAL</span>
                            <span>{total} $</span>
                        </div>
                    </div>
                </div>

                <div className="receipt-thanks">
                    <p style={{ fontWeight: '600', marginBottom: '8px' }}>Merci de votre confiance !</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Cette facture est générée numériquement et est valable sans signature.</p>
                </div>
            </div>

            <style>{`
                .receipt-container {
                    padding-bottom: 40px;
                }
                .receipt-paper {
                    background: white;
                    color: black;
                    padding: clamp(20px, 8vw, 60px);
                    border-radius: 4px;
                    max-width: 850px;
                    margin: 0 auto;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .receipt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: clamp(30px, 8vw, 60px);
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 32px;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                .receipt-logo {
                    font-size: clamp(1.8rem, 5vw, 2.5rem);
                    font-weight: 800;
                    font-style: italic;
                    margin: 0;
                    color: var(--bg);
                    line-height: 1;
                }
                .receipt-subtitle {
                    color: var(--text-muted);
                    margin: 8px 0 0;
                    font-size: 0.9rem;
                }
                .receipt-meta {
                    text-align: right;
                }
                .receipt-type {
                    font-size: 1.25rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0 0 8px 0;
                }
                .receipt-number, .receipt-date {
                    color: var(--text-muted);
                    margin: 4px 0 0;
                    font-size: 0.9rem;
                }
                .receipt-client-vendeur {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    margin-bottom: clamp(30px, 8vw, 60px);
                }
                .receipt-label {
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin: 0 0 12px 0;
                }
                .receipt-name {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin: 0;
                }
                .receipt-info {
                    color: var(--text-muted);
                    margin: 4px 0 0;
                    font-size: 0.9rem;
                }
                .receipt-table-wrapper {
                    overflow-x: auto;
                    margin-bottom: 40px;
                    border-bottom: 2px solid var(--bg);
                }
                .receipt-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 400px;
                }
                .receipt-table th {
                    padding: 12px 0;
                    text-align: left;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    border-bottom: 2px solid var(--bg);
                }
                .receipt-table td {
                    padding: 16px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                .receipt-footer-section {
                    display: flex;
                    justify-content: flex-end;
                }
                .receipt-summary {
                    width: 100%;
                    max-width: 250px;
                }
                .receipt-summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .receipt-summary-row.total {
                    border-top: 2px solid var(--bg);
                    padding-top: 16px;
                    margin-top: 12px;
                    font-size: 1.25rem;
                    font-weight: 800;
                }
                .receipt-thanks {
                    margin-top: 60px;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 32px;
                    text-align: center;
                }
                @media (max-width: 600px) {
                    .receipt-meta { text-align: left; }
                    .receipt-client-vendeur { grid-template-columns: 1fr; gap: 24px; }
                    .receipt-vendeur { order: 2; }
                    .receipt-client { order: 1; }
                    .desktop-only { display: none; }
                }
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    html, body, #root {
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #printable-receipt, #printable-receipt * {
                        visibility: visible;
                    }
                    #printable-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 20px !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .no-print { 
                        display: none !important; 
                    }
                }
            `}</style>
        </div>
    );
}
