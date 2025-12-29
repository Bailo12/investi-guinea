# Backend Setup - Guide Complet

## ✅ Backend Node.js/Express Créé

Un backend complet a été créé avec toutes les fonctionnalités nécessaires pour la plateforme Neo Tech Investment.

## 📁 Structure du Backend

```
backend/
├── config/
│   └── database.js          # Configuration MongoDB
├── controllers/
│   ├── auth.controller.js   # Authentification
│   ├── wallet.controller.js # Portefeuille
│   ├── kyc.controller.js     # KYC/AML
│   ├── products.controller.js
│   ├── premium.controller.js
│   ├── trading.controller.js
│   ├── security.controller.js
│   └── reports.controller.js
├── middleware/
│   ├── auth.middleware.js   # JWT protection
│   ├── encryption.middleware.js
│   └── errorHandler.js
├── models/
│   ├── User.model.js
│   ├── Wallet.model.js
│   ├── Transaction.model.js
│   ├── KYC.model.js
│   ├── Product.model.js
│   └── Premium.model.js
├── routes/
│   ├── auth.routes.js
│   ├── wallet.routes.js
│   ├── kyc.routes.js
│   ├── products.routes.js
│   ├── premium.routes.js
│   ├── trading.routes.js
│   ├── security.routes.js
│   └── reports.routes.js
├── server.js                # Point d'entrée
├── package.json
└── .env.example
```

## 🚀 Installation et Démarrage

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
```

Éditez `.env` avec vos configurations:
- MongoDB URI
- JWT Secret
- Clés API (Orange Money, MTN, Crypto, Forex)

### 3. Démarrer MongoDB

Assurez-vous que MongoDB est en cours d'exécution:

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### 4. Démarrer le serveur

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 Routes API Disponibles

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile` - Mettre à jour le profil

### Portefeuille
- `GET /api/wallet` - Obtenir le portefeuille
- `POST /api/wallet/deposit` - Dépôt
- `POST /api/wallet/withdraw` - Retrait
- `GET /api/wallet/transactions` - Historique

### KYC/AML
- `POST /api/kyc/submit` - Soumettre KYC
- `GET /api/kyc` - Statut KYC
- `POST /api/kyc/verify-id` - Vérifier ID
- `POST /api/kyc/aml-checks` - Vérifications AML

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails produit
- `POST /api/products/:id/invest` - Investir

### Premium
- `GET /api/premium/account` - Compte premium
- `GET /api/premium/plans` - Plans premium
- `POST /api/premium/subscribe` - S'abonner
- `GET /api/premium/projects` - Projets premium

### Trading
- `GET /api/trading/crypto/wallets` - Portefeuilles crypto
- `GET /api/trading/crypto/prices` - Prix crypto
- `POST /api/trading/crypto/trades` - Trade crypto
- `GET /api/trading/forex/account` - Compte forex
- `POST /api/trading/forex/trades` - Trade forex

### Sécurité
- `POST /api/security/fraud/analyze` - Analyser transaction
- `GET /api/security/fraud/alerts` - Alertes fraude
- `GET /api/security/compliance` - Conformité
- `GET /api/security/audit/logs` - Journaux d'audit

### Rapports
- `GET /api/reports/dashboard` - Statistiques dashboard
- `GET /api/reports/transactions` - Rapport transactions
- `GET /api/reports/fees` - Rapport frais

## 🔐 Sécurité Implémentée

- ✅ Authentification JWT
- ✅ Chiffrement des données sensibles
- ✅ Hash des mots de passe (bcrypt)
- ✅ Rate limiting
- ✅ Helmet pour headers de sécurité
- ✅ Validation des entrées
- ✅ Protection CORS

## 🗄️ Modèles de Données

### User
- Informations utilisateur
- Statut KYC
- Statut Premium
- Rôle (user/admin)

### Wallet
- Solde
- Devise
- Transactions

### Transaction
- Type (deposit/withdraw/investment)
- Montant et frais
- Méthode de paiement
- Statut

### KYC
- Informations personnelles
- Documents d'identité
- Vérifications AML
- Statut de vérification

### Product
- Type de produit
- Détails d'investissement
- Statut premium

### PremiumAccount
- Plan premium
- Dates d'abonnement
- Avantages

## 🔌 Intégrations à Implémenter

### Mobile Money
- Orange Money API
- MTN Mobile Money API

### Crypto
- Binance API
- Coinbase API

### Forex
- Broker API (MetaTrader, etc.)

### KYC/AML
- Service de vérification d'identité (Jumio, Onfido)
- Service AML (ComplyAdvantage)

## 📝 Notes Importantes

1. **MongoDB**: Assurez-vous que MongoDB est installé et en cours d'exécution
2. **Variables d'environnement**: Configurez toutes les variables dans `.env`
3. **Uploads**: Créez le dossier `uploads/` pour les fichiers uploadés
4. **Production**: Changez `NODE_ENV=production` et configurez les secrets

## 🧪 Test des Routes

Vous pouvez tester les routes avec:
- Postman
- cURL
- L'application Angular (une fois connectée)

## 🚀 Prochaines Étapes

1. Configurer MongoDB
2. Remplir les variables d'environnement
3. Tester les routes API
4. Intégrer les APIs externes
5. Déployer en production

---

**Le backend est prêt à être utilisé avec l'application Angular !**


