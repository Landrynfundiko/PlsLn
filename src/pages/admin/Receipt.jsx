import React from 'react';
import { Printer, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Receipt({ customerName, items, total }) {
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
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`reçu-PLS-STORE-${customerName || 'client'}.pdf`);
        } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
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
                    className="admin-btn-primary"
                    style={{ background: '#334155', color: 'white' }}
                >
                    <Download size={18} /> <span>Télécharger PDF</span>
                </button>
            </div>

            <div className="receipt-paper" id="printable-receipt">
                <div className="receipt-header">
                    <div>
                        <h1 className="receipt-logo">PLS STORE</h1>
                        <p className="receipt-subtitle">Boutique de vêtements & Accessoires</p>
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
                        <p className="receipt-name">Landry Fundiko</p>
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
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Cette facture est générée numériquement et est valable sans signature.</p>
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
                    color: #0f172a;
                    line-height: 1;
                }
                .receipt-subtitle {
                    color: #64748b;
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
                    color: #64748b;
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
                    color: #94a3b8;
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
                    color: #64748b;
                    margin: 4px 0 0;
                    font-size: 0.9rem;
                }
                .receipt-table-wrapper {
                    overflow-x: auto;
                    margin-bottom: 40px;
                    border-bottom: 2px solid #0f172a;
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
                    border-bottom: 2px solid #0f172a;
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
                    border-top: 2px solid #0f172a;
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
                  .no-print { display: none !important; }
                  body { background: white !important; }
                  .admin-layout { display: block !important; }
                  .admin-sidebar { display: none !important; }
                  .admin-mobile-bar { display: none !important; }
                  main { padding: 0 !important; margin: 0 !important; }
                  .receipt-paper { box-shadow: none !important; padding: 0 !important; width: 100% !important; max-width: none !important; }
                }
            `}</style>
        </div>
    );
}
