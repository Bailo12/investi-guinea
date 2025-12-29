# Neo Tech Investment - Backend API

Backend Node.js/Express pour la plateforme d'investissement Neo Tech Investment.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Configurer les variables d'environnement dans .env
```

## ⚙️ Configuration

Éditez le fichier `.env` avec vos configurations:

- `PORT` - Port du serveur (défaut: 3000)
- `MONGODB_URI` - URI de connexion MongoDB
- `JWT_SECRET` - Clé secrète pour JWT
- `ENCRYPTION_KEY` - Clé de chiffrement (32 caractères)

## 📦 Dépendances Principales

- **Express** - Framework web
- **Mongoose** - ODM MongoDB
- **JWT** - Authentification
- **Bcrypt** - Hash des mots de passe
- **CryptoJS** - Chiffrement
- **Multer** - Upload de fichiers
- **Helmet** - Sécurité HTTP
- **CORS** - Cross-Origin Resource Sharing

## 🏃 Démarrage

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

## 📡 Routes API

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile` - Mettre à jour le profil

### Portefeuille

- `GET /api/wallet` - Obtenir le portefeuille
- `POST /api/wallet/deposit` - Dépôt
- `POST /api/wallet/withdraw` - Retrait
- `GET /api/wallet/transactions` - Historique des transactions

### KYC/AML

- `POST /api/kyc/submit` - Soumettre KYC
- `GET /api/kyc` - Obtenir statut KYC
- `PUT /api/kyc` - Mettre à jour KYC
- `POST /api/kyc/verify-id` - Vérifier ID
- `POST /api/kyc/aml-checks` - Vérifications AML
- `GET /api/kyc/compliance-report` - Rapport de conformité

### Produits

- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products/:id/invest` - Investir dans un produit

### Premium

- `GET /api/premium/account` - Compte premium
- `GET /api/premium/plans` - Plans premium
- `POST /api/premium/subscribe` - S'abonner
- `POST /api/premium/cancel` - Annuler abonnement
- `POST /api/premium/renew` - Renouveler abonnement
- `GET /api/premium/status` - Statut premium
- `GET /api/premium/projects` - Projets premium
- `GET /api/premium/projects/:id` - Détails projet premium
- `POST /api/premium/projects/:id/invest` - Investir dans projet premium

## 🔐 Sécurité

- Authentification JWT
- Chiffrement des données sensibles
- Hash des mots de passe (bcrypt)
- Rate limiting
- Helmet pour les headers de sécurité
- Validation des entrées

## 📝 Notes

- Les intégrations avec Orange Money, MTN, Crypto, Forex sont à implémenter
- Les services KYC/AML externes sont à intégrer
- Les uploads de fichiers sont stockés dans `./uploads` by default. You can change this with the `UPLOAD_PATH` environment variable.

## Uploads directory

The repository contains a `backend/uploads/` directory (kept in git with a `.gitkeep`). This folder is used to store uploaded files during development (KYC documents, user avatars, etc.).

Set `UPLOAD_PATH` in your `.env` if you want to store uploads elsewhere or use a cloud storage adapter in production.

## 🗄️ Base de Données

MongoDB avec les collections suivantes:

- Users
- Wallets
- Transactions
- KYC
- Products
- PremiumAccounts
- PremiumProjects
