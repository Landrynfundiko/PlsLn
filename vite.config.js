import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 1. 'autoUpdate' force l'application à se mettre à jour dès qu'une nouveauté est disponible
      registerType: 'autoUpdate',

      // 2. Cette option indique au plugin de générer automatiquement le Service Worker de mise en cache
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'], // Types de fichiers à stocker pour le hors-ligne
      },

      includeAssets: ['favicon.ico', 'logo.png'],
      manifest: {
        name: 'PLS Shoe Store',
        short_name: 'ShoeStore',
        description: 'La meilleure boutique de chaussures en ligne',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'plslog.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'plslog.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});