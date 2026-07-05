import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const config = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
        config[key] = value;
    }
});

// 2. Setup Firebase Config
const firebaseConfig = {
    apiKey: config.VITE_FIREBASE_API_KEY,
    authDomain: config.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: config.VITE_FIREBASE_PROJECT_ID,
    storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: config.VITE_FIREBASE_APP_ID,
    measurementId: config.VITE_FIREBASE_MEASUREMENT_ID
};

console.log("Initialisation de Firebase avec le projet ID:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to convert asset to base64
const getBase64Image = (filename) => {
    const assetPath = path.join(__dirname, 'src', 'assets', filename);
    if (fs.existsSync(assetPath)) {
        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.avif') mimeType = 'image/avif';
        
        const data = fs.readFileSync(assetPath);
        return `data:${mimeType};base64,${data.toString('base64')}`;
    }
    // Tiny 1x1 grey pixel as fallback
    return 'data:image/png;base64,iVBORw0KGgoAAAANSAAAABJRU5ErkJggg==';
};

const seed = async () => {
    try {
        console.log("Nettoyage de la collection 'products'...");
        const querySnapshot = await getDocs(collection(db, "products"));
        for (const document of querySnapshot.docs) {
            await deleteDoc(doc(db, "products", document.id));
        }
        console.log("Collection 'products' nettoyée.");

        console.log("Injection des produits de test...");
        const productsToSeed = [
            {
                name: 'Nike Air Force 1',
                price: '18.9 USD',
                category: 'Nike',
                description: 'Le classique indémodable. Confort et style au rendez-vous pour cette paire iconique.',
                stock: 25,
                image: getBase64Image('DN.PNG'), // Fallback to DN.PNG
                createdAt: new Date().toISOString()
            },
            {
                name: 'Nike DN Black',
                price: '19.3 USD',
                category: 'Nike',
                description: 'Un design futuriste et audacieux. Parfait pour se démarquer avec une touche unique.',
                stock: 12,
                image: getBase64Image('DN.PNG'),
                createdAt: new Date().toISOString()
            },
            {
                name: 'Nike DN Special',
                price: '19.3 USD',
                category: 'Nike',
                description: 'Une édition spéciale de la Nike DN. Détails soignés et coloris exclusif.',
                stock: 18,
                image: getBase64Image('DN2.JPG'),
                createdAt: new Date().toISOString()
            },
            {
                name: 'Nike TN 2019',
                price: '20.6 USD',
                category: 'Nike',
                description: 'La TN, agressive et sportive. Idéale pour un look streetwear affirmé.',
                stock: 5, // Alertes stock faible
                image: getBase64Image('TN.JPG'),
                createdAt: new Date().toISOString()
            },
            {
                name: 'Cactus Jack',
                price: '20.9 USD',
                category: 'Travis Scott',
                description: 'Collaboration exclusive. Matériaux premium et design signature de Travis Scott.',
                stock: 9, // Alertes stock faible
                image: getBase64Image('cactus.AVIF'),
                createdAt: new Date().toISOString()
            },
            {
                name: 'Campus 00s',
                price: '19.3 USD',
                category: 'Adidas',
                description: 'Le retour des années 2000. Silhouette large et confortable, un must-have actuel.',
                stock: 30,
                image: getBase64Image('cpus.JPG'),
                createdAt: new Date().toISOString()
            }
        ];

        for (const p of productsToSeed) {
            const docRef = await addDoc(collection(db, "products"), p);
            console.log(`Produit ajouté : ${p.name} avec ID: ${docRef.id}`);
        }

        console.log("Base de données initialisée avec succès !");
        process.exit(0);
    } catch (e) {
        console.error("Erreur d'initialisation de la base de données :", e);
        process.exit(1);
    }
};

seed();
