import React from 'react'
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa'

export default function Pieds() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h4 style={{ fontSize: '1.5rem', marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>
                        PLS<span style={{ color: '#00ffcc', fontFamily: "'Outfit', sans-serif" }}>STORE</span>
                    </h4>
                    <p style={{ color: 'var(--text-muted)' }}>La destination ultime pour le style et l'innovation.</p>
                </div>

                <div className="footer-section">
                    <h4 style={{ marginBottom: '20px' }}>Suivez-nous</h4>
                    <div style={{ display: 'flex', gap: '20px' }} className="social-icons">
                        {[<FaInstagram />, <FaFacebook />, <FaWhatsapp />].map((icon, i) => (
                            <a key={i} href="#" style={{
                                color: 'white',
                                fontSize: '1.5rem',
                                opacity: 0.7,
                                transition: 'opacity 0.3s'
                            }}
                                onMouseEnter={(e) => e.target.style.opacity = 1}
                                onMouseLeave={(e) => e.target.style.opacity = 0.7}
                            >
                                {icon}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="footer-section">
                    <h4 style={{ marginBottom: '20px' }}>Contact</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>plsstoreshoes@gmail.com</p>
                    <p style={{ color: 'var(--text-muted)' }}>Bukavu, RD Congo</p>
                </div>
            </div>

            <div className="footer-copyright">
                © 2026 PLS STORE. All rights reserved.
            </div>
        </footer>
    )
}
