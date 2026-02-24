import React from 'react';
import { Printer, Download, Share2 } from 'lucide-react';

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

    return (
        <div className="receipt-container">
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginBottom: '24px' }} className="no-print">
                <button
                    onClick={handlePrint}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'black', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                    <Printer size={18} /> Imprimer
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    <Download size={18} /> PDF
                </button>
            </div>

            <div style={{
                background: 'white',
                color: 'black',
                padding: '60px',
                borderRadius: '4px',
                maxWidth: '800px',
                margin: '0 auto',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Inter, system-ui, sans-serif'
            }} id="printable-receipt">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px', borderBottom: '2px solid #f1f5f9', paddingBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', fontStyle: 'italic', margin: 0, color: '#0f172a' }}>PLS STORE</h1>
                        <p style={{ color: '#64748b', margin: '4px 0' }}>Boutique de vêtements & Accessoires</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>FACTURE</h2>
                        <p style={{ color: '#64748b', margin: 0 }}>#{Math.floor(Math.random() * 900000) + 100000}</p>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>{date}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }}>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 12px 0' }}>Client</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{customerName}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 12px 0' }}>Vendeur</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Landry Fundiko</p>
                        <p style={{ color: '#64748b', margin: '4px 0' }}>Admin PLS STORE</p>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                    <thead style={{ borderBottom: '2px solid #0f172a' }}>
                        <tr>
                            <th style={{ padding: '12px 0', textAlign: 'left', fontSize: '0.875rem' }}>ARTICLE</th>
                            <th style={{ padding: '12px 0', textAlign: 'center', fontSize: '0.875rem' }}>QTÉ</th>
                            <th style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.875rem' }}>PRIX UNITAIRE</th>
                            <th style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.875rem' }}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => {
                            const unitPrice = parseFloat(item.price.replace(',', '.').split(' ')[0]);
                            return (
                                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 0', fontWeight: '500' }}>{item.name}</td>
                                    <td style={{ padding: '16px 0', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right' }}>{unitPrice.toFixed(2)} $</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '600' }}>{(unitPrice * item.quantity).toFixed(2)} $</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '250px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#64748b' }}>Sous-total</span>
                            <span style={{ fontWeight: '500' }}>{total} $</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ color: '#64748b' }}>TVA (0%)</span>
                            <span style={{ fontWeight: '500' }}>0.00 $</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '16px' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>TOTAL</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>{total} $</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '80px', borderTop: '1px solid #f1f5f9', paddingTop: '32px', textAlign: 'center' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px' }}>Merci de votre confiance !</p>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Cette facture est générée numériquement et est valable sans signature.</p>
                </div>
            </div>

            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .admin-layout { display: block !important; }
          .admin-sidebar { display: none !important; }
          main { padding: 0 !important; }
          #printable-receipt { box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>
        </div>
    );
}
