import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Package,
    Receipt,
    History,
    LogOut,
    ChevronRight,
    User,
    Menu,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function AdminLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Déconnexion réussie");
            navigate('/connexion');
        } catch (error) {
            toast.error("Erreur lors de la déconnexion");
        }
    };

    const navItems = [
        { path: '/admin/stock', icon: Package, label: 'Gestion Stock' },
        { path: '/admin/facturation', icon: Receipt, label: 'Facturation' },
        { path: '/admin/historique', icon: History, label: 'Historique Ventes' },
    ];

    const SidebarContent = () => (
        <>
            <div className="admin-sidebar-header">
                <h1 className="admin-sidebar-logo">PLS ADMIN</h1>
                <p className="admin-sidebar-sub">Espace de gestion</p>
            </div>

            <nav className="admin-sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `admin-nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                        <ChevronRight size={16} className="admin-nav-chevron" />
                    </NavLink>
                ))}
            </nav>

            <div className="admin-sidebar-footer">
                <div className="admin-sidebar-user">
                    <div className="admin-user-avatar">
                        <User size={20} color="black" />
                    </div>
                    <div>
                        <p className="admin-user-name">Admin</p>
                        <p className="admin-user-email">{auth.currentUser?.email}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="admin-logout-btn">
                    <LogOut size={20} />
                    Déconnexion
                </button>
            </div>
        </>
    );

    return (
        <div className="admin-layout">
            {/* Barre mobile haut */}
            <div className="admin-mobile-bar">
                <h1 className="admin-sidebar-logo" style={{ fontSize: '1.1rem' }}>PLS ADMIN</h1>
                <button
                    className="admin-burger-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Ouvrir le menu"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Sidebar desktop */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                className="admin-sidebar admin-sidebar-desktop"
            >
                <SidebarContent />
            </motion.aside>

            {/* Sidebar mobile (drawer) */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            className="admin-sidebar-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            className="admin-sidebar admin-sidebar-mobile"
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'tween', duration: 0.28 }}
                        >
                            <button
                                className="admin-sidebar-close"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X size={20} />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
