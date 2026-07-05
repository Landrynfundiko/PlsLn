import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
    DollarSign, 
    ShoppingCart, 
    Package, 
    TrendingUp, 
    AlertTriangle,
    Download, 
    FileSpreadsheet, 
    FileText,
    TrendingDown,
    Calendar,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTheme } from '../../context/ThemeContext';

export default function Stats() {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        // Fetch Sales History
        const unsubSales = onSnapshot(collection(db, "salesHistory"), (snapshot) => {
            const salesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSales(salesList);
            checkLoading();
        }, (error) => {
            console.error("Firestore error in Stats (salesHistory):", error);
            toast.error("Erreur de chargement des ventes");
        });

        // Fetch Products Inventory
        const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
            const productsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsList);
            checkLoading();
        }, (error) => {
            console.error("Firestore error in Stats (products):", error);
            toast.error("Erreur de chargement des produits");
        });

        const checkLoading = () => {
            setLoading(false);
        };

        return () => {
            unsubSales();
            unsubProducts();
        };
    }, []);

    // Calculate metrics
    const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const totalOrders = sales.length;
    const totalItemsSold = sales.reduce((sum, s) => {
        if (!s.items || !Array.isArray(s.items)) return sum;
        return sum + s.items.reduce((itemSum, item) => itemSum + (Number(item.quantity) || 0), 0);
    }, 0);
    const totalProductsCount = products.length;
    const totalStockQty = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    
    // Low stock items count (stock <= 10)
    const lowStockItems = products.filter(p => (Number(p.stock) || 0) <= 10);
    const lowStockCount = lowStockItems.length;

    // Total Inventory Value
    const totalInventoryValue = products.reduce((sum, p) => {
        const price = parseFloat(p.price?.replace(',', '.').split(' ')[0]) || 0;
        const stock = Number(p.stock) || 0;
        return sum + (price * stock);
    }, 0);

    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // Group sales by Date (last 7 days or periods)
    const getSalesByDate = () => {
        const dateGroups = {};
        sales.forEach(sale => {
            if (!sale.date) return;
            const dateStr = new Date(sale.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
            dateGroups[dateStr] = (dateGroups[dateStr] || 0) + (Number(sale.total) || 0);
        });

        // Convert to array and sort chronologically (safely assuming date keys can be sorted by sale list order)
        // Let's get the last 7 distinct dates where sales occurred
        return Object.entries(dateGroups)
            .map(([date, amount]) => ({ date, amount }))
            .reverse() // from latest back
            .slice(0, 7) // take last 7
            .reverse(); // back to chronological
    };

    const salesOverTime = getSalesByDate();

    // Top selling products aggregation
    const getTopProducts = () => {
        const productCounts = {};
        sales.forEach(sale => {
            if (!sale.items || !Array.isArray(sale.items)) return;
            sale.items.forEach(item => {
                const name = item.name || 'Produit inconnu';
                productCounts[name] = (productCounts[name] || 0) + (Number(item.quantity) || 0);
            });
        });

        return Object.entries(productCounts)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5); // top 5
    };

    const topProducts = getTopProducts();

    // Category Sales breakdown
    const getCategoryBreakdown = () => {
        const categoryCounts = {};
        sales.forEach(sale => {
            if (!sale.items || !Array.isArray(sale.items)) return;
            sale.items.forEach(item => {
                // Find product category from local product list
                const product = products.find(p => p.id === item.productId || p.name === item.name);
                const category = product?.category || 'Autre';
                categoryCounts[category] = (categoryCounts[category] || 0) + (Number(item.quantity) || 0);
            });
        });

        return Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
    };

    const categoryBreakdown = getCategoryBreakdown();

    // SVG Line Chart Helpers
    const chartHeight = 180;
    const chartWidth = 500;
    const padding = 30;

    const getSVGCoordinates = () => {
        if (salesOverTime.length === 0) return '';
        const maxAmount = Math.max(...salesOverTime.map(d => d.amount), 100);
        
        return salesOverTime.map((d, index) => {
            const x = padding + (index / (salesOverTime.length - 1)) * (chartWidth - padding * 2);
            const y = chartHeight - padding - (d.amount / maxAmount) * (chartHeight - padding * 2);
            return { x, y };
        });
    };

    const svgPoints = getSVGCoordinates();
    const linePath = svgPoints.length > 0 
        ? `M ${svgPoints[0].x} ${svgPoints[0].y} ` + svgPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
        : '';

    // Area path helper
    const areaPath = svgPoints.length > 0
        ? `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${chartHeight - padding} L ${svgPoints[0].x} ${chartHeight - padding} Z`
        : '';

    // CSV Download - Sales History
    const handleDownloadSalesCSV = () => {
        if (sales.length === 0) {
            toast.error("Aucune vente à exporter");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID Vente,Date,Client,Articles,Total (USD)\n";

        sales.forEach(sale => {
            const dateStr = sale.date ? new Date(sale.date).toLocaleString('fr-FR').replace(',', '') : 'Inconnue';
            const client = sale.customerName?.replace(/"/g, '""') || 'Client Inconnu';
            const itemsList = sale.items?.map(i => `${i.quantity}x ${i.name}`).join(' | ').replace(/"/g, '""') || '';
            const total = sale.total || 0;
            
            csvContent += `"${sale.id}","${dateStr}","${client}","${itemsList}",${total}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Rapport-Ventes_PLS_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Rapport des ventes CSV téléchargé !");
    };

    // CSV Download - Stock Inventory
    const handleDownloadStockCSV = () => {
        if (products.length === 0) {
            toast.error("Aucun produit à exporter");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID Produit,Nom,Categorie,Prix,Stock,Valeur Total Inventaire (USD)\n";

        products.forEach(p => {
            const name = p.name?.replace(/"/g, '""') || 'Inconnu';
            const category = p.category?.replace(/"/g, '""') || 'Inconnu';
            const priceVal = parseFloat(p.price?.replace(',', '.').split(' ')[0]) || 0;
            const stock = p.stock || 0;
            const totalVal = (priceVal * stock).toFixed(2);
            
            csvContent += `"${p.id}","${name}","${category}",${priceVal},${stock},${totalVal}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Inventaire-Stock_PLS_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Inventaire de stock CSV téléchargé !");
    };

    // PDF Download - Global Financial Report
    const handleDownloadFinancialPDF = async () => {
        const element = document.getElementById('financial-report-pdf-area');
        if (!element) {
            toast.error("Zone d'export introuvable");
            return;
        }

        try {
            setIsExportingPDF(true);
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: theme === 'dark' ? '#1E1412' : '#FDFCF0' // Fais correspondre le fond
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
            pdf.save(`Rapport-Financier-PLS_${new Date().toISOString().slice(0,10)}.pdf`);

            toast.success("Rapport financier PDF généré !");
        } catch (error) {
            console.error("PDF Export error:", error);
            toast.error("Erreur lors de la génération du rapport PDF");
        } finally {
            setIsExportingPDF(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={36} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="admin-stats-page" style={{ color: 'var(--text)', fontFamily: 'var(--font-main)' }}>
            <Toaster position="top-right" reverseOrder={false} />

            {/* Header Area */}
            <div className="stock-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 className="admin-page-title" style={{ color: 'var(--text)', fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '800' }}>
                        Tableau de Bord
                    </h2>
                    <p className="admin-page-subtitle" style={{ color: 'var(--text-muted)' }}>
                        Statistiques financières et d'inventaire de PLS STORE en temps réel.
                    </p>
                </div>

                {/* Report Download controls */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleDownloadStockCSV}
                        className="admin-btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    >
                        <Package size={18} />
                        <span>Stock CSV</span>
                    </button>
                </div>
            </div>

            {/* Main Report Container - This is targeted for PDF capture */}
            <div id="financial-report-pdf-area" style={{ padding: '24px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                
                {/* PDF Only Brand Header */}
                <div className="pdf-only-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(199, 206, 105, 0.2)', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ color: 'var(--text)', fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0 }}>PLS STORE - RAPPORT FINANCIER</h1>
                        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '12px' }}>Généré automatiquement par le système d'administration</p>
                    </div>
                    <div style={{ textAlignment: 'right', color: 'var(--text)', fontSize: '14px' }}>
                        <strong>Date:</strong> {new Date().toLocaleDateString('fr-FR')}
                    </div>
                </div>

                {/* KPI Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Revenue Card */}
                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="admin-card" 
                        style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '16px', background: 'rgba(199, 206, 105, 0.08)', borderRadius: '16px', color: 'var(--primary)' }}>
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Chiffre d'Affaires</span>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginTop: '4px' }}>
                                {totalRevenue.toFixed(2)} $
                            </h3>
                        </div>
                        <div style={{ position: 'absolute', right: '16px', top: '16px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', fontWeight: '600' }}>
                            <ArrowUpRight size={14} /> Active
                        </div>
                    </motion.div>

                    {/* Orders Card */}
                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="admin-card" 
                        style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}
                    >
                        <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '16px', color: '#3b82f6' }}>
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Ventes Enregistrées</span>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginTop: '4px' }}>
                                {totalOrders}
                            </h3>
                        </div>
                    </motion.div>

                    {/* Inventory Value Card */}
                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="admin-card" 
                        style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}
                    >
                        <div style={{ padding: '16px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '16px', color: '#a855f7' }}>
                            <Package size={24} />
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Valeur Stock (Prix Vente)</span>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginTop: '4px' }}>
                                {totalInventoryValue.toFixed(2)} $
                            </h3>
                        </div>
                    </motion.div>

                    {/* Low Stock Card */}
                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="admin-card" 
                        style={{ 
                            padding: '24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '20px',
                            border: lowStockCount > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border)'
                        }}
                    >
                        <div style={{ 
                            padding: '16px', 
                            background: lowStockCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(199, 206, 105, 0.08)', 
                            borderRadius: '16px', 
                            color: lowStockCount > 0 ? '#ef4444' : 'var(--primary)' 
                        }}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Alertes Stock</span>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: lowStockCount > 0 ? '#ef4444' : 'var(--text)', marginTop: '4px' }}>
                                {lowStockCount} {lowStockCount > 1 ? 'produits' : 'produit'}
                            </h3>
                        </div>
                    </motion.div>
                </div>

                {/* Additional metrics info line */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    <div className="admin-card" style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Panier moyen admin :</span>
                        <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{averageOrderValue.toFixed(2)} $</strong>
                    </div>
                    <div className="admin-card" style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Articles vendus :</span>
                        <strong style={{ color: 'var(--text)', fontSize: '1.1rem' }}>{totalItemsSold} unités</strong>
                    </div>
                    <div className="admin-card" style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Articles en inventaire :</span>
                        <strong style={{ color: 'var(--text)', fontSize: '1.1rem' }}>{totalStockQty} unités ({totalProductsCount} Réf)</strong>
                    </div>
                </div>

                {/* Charts Area */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '32px',
                    marginBottom: '32px'
                }}>
                    
                    {/* Sales Evolution Line Chart */}
                    <div className="admin-card" style={{ padding: '24px' }}>
                        <h4 style={{ color: 'var(--text)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} color="var(--primary)" /> Évolution des Ventes (Dernières journées)
                        </h4>

                        {salesOverTime.length === 0 ? (
                            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                Aucune donnée de vente disponible
                            </div>
                        ) : (
                            <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                                <svg 
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    className="sales-svg-chart"
                                >
                                    <defs>
                                        <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Y Gridlines */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                        const y = padding + ratio * (chartHeight - padding * 2);
                                        return (
                                            <line 
                                                key={i} 
                                                x1={padding} 
                                                y1={y} 
                                                x2={chartWidth - padding} 
                                                y2={y} 
                                                stroke="var(--border)" 
                                                strokeWidth="1" 
                                            />
                                        );
                                    })}

                                    {/* Filled Area */}
                                    <path d={areaPath} fill="url(#sales-gradient)" />

                                    {/* Main Line */}
                                    <path 
                                        d={linePath} 
                                        fill="none" 
                                        stroke="var(--primary)" 
                                        strokeWidth="3" 
                                        strokeLinecap="round"
                                        strokeLinejoin="round" 
                                    />

                                    {/* Points and Tooltips */}
                                    {svgPoints.map((pt, i) => (
                                        <g key={i}>
                                            <circle 
                                                cx={pt.x} 
                                                cy={pt.y} 
                                                r="5" 
                                                fill="var(--bg)" 
                                                stroke="var(--primary)" 
                                                strokeWidth="2.5" 
                                            />
                                            {/* Labels below points */}
                                            <text 
                                                x={pt.x} 
                                                y={chartHeight - 8} 
                                                fill="var(--text-muted)" 
                                                fontSize="9" 
                                                textAnchor="middle"
                                                fontWeight="600"
                                            >
                                                {salesOverTime[i].date}
                                            </text>
                                            {/* Amount tags above points */}
                                            <text 
                                                x={pt.x} 
                                                y={pt.y - 10} 
                                                fill="var(--text)" 
                                                fontSize="9" 
                                                textAnchor="middle" 
                                                fontWeight="700"
                                            >
                                                {Math.round(salesOverTime[i].amount)} $
                                            </text>
                                        </g>
                                    ))}
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Top Products Bar Chart */}
                    <div className="admin-card" style={{ padding: '24px' }}>
                        <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} color="#3b82f6" /> Top 5 des Ventes par Produit
                        </h4>

                        {topProducts.length === 0 ? (
                            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                Aucune donnée de vente disponible
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {topProducts.map((p, idx) => {
                                    const maxVal = Math.max(...topProducts.map(tp => tp.quantity), 1);
                                    const percent = (p.quantity / maxVal) * 100;
                                    return (
                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                <span style={{ fontWeight: '500', color: 'var(--text)' }}>{p.name}</span>
                                                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{p.quantity} {p.quantity > 1 ? 'unités' : 'unité'}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                                                    style={{ height: '100%', background: 'linear-gradient(to right, #3b82f6, var(--primary))', borderRadius: '4px' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Inventory Status & Low Stock alerts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                    
                    {/* Low Stock details list */}
                    <div className="admin-card" style={{ padding: '24px' }}>
                        <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} /> Alerte de Stock Faible
                        </h4>
                        
                        <div style={{ overflowY: 'auto', maxHeight: '220px', paddingRight: '4px' }}>
                            {lowStockItems.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: '#22c55e', fontSize: '0.9rem', fontWeight: '500' }}>
                                    ✓ Aucun produit en stock faible.
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                            <th style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Produit</th>
                                            <th style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Catégorie</th>
                                            <th style={{ padding: '8px 0', color: 'var(--text-muted)', textAlign: 'right' }}>Quantité</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lowStockItems.map((p, idx) => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '10px 0', color: 'var(--text)', fontWeight: '500' }}>{p.name}</td>
                                                <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>{p.category}</td>
                                                <td style={{ padding: '10px 0', color: '#ef4444', textAlign: 'right', fontWeight: '700' }}>
                                                    {p.stock} restant{p.stock > 1 ? 's' : ''}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Sales category split */}
                    <div className="admin-card" style={{ padding: '24px' }}>
                        <h4 style={{ color: 'var(--text)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} color="#a855f7" /> Répartition des ventes par Catégorie
                        </h4>

                        {categoryBreakdown.length === 0 ? (
                            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                Aucune catégorie de vente
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {categoryBreakdown.map((cat, idx) => {
                                    const totalCatSales = categoryBreakdown.reduce((sum, item) => sum + item.count, 0);
                                    const percent = ((cat.count / totalCatSales) * 100).toFixed(0);
                                    const colors = ['#C7CE69', '#3b82f6', '#a855f7', '#ef4444', '#f97316'];
                                    const color = colors[idx % colors.length];

                                    return (
                                        <div key={idx}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                <span style={{ color: 'var(--text)', fontWeight: '500' }}>{cat.category}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>{cat.count} vendus ({percent}%)</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                                                <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '3px' }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print & PDF styling hacks */}
            <style>{`
                .pdf-only-header {
                    display: none;
                }
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
                
                /* Quand l'élément est capturé par html2canvas */
                #financial-report-pdf-area {
                    box-shadow: none !important;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
