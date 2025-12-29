# Neo Tech Investment - Plateforme d'Investissement Sécurisée

Une plateforme web et mobile sécurisée pour la gestion d'investissements en Guinée Conakry.

## 🚀 Fonctionnalités

### Web Application (Angular)
- ✅ Authentification sécurisée (Login/Register)
- ✅ Tableau de bord avec statistiques d'investissement
- ✅ Gestion complète du portefeuille d'investissements
- ✅ Suivi des performances (rendements, gains/pertes)
- ✅ Support multi-devises (GNF, USD, EUR)
- ✅ Interface moderne et responsive
- ✅ Sécurité renforcée (JWT, chiffrement des données)

### Types d'investissements supportés
- Actions
- Obligations
- Immobilier
- Cryptomonnaie
- Fonds mutuels
- Autre

## 🛠️ Technologies

- **Frontend**: Angular 17 (Standalone Components)
- **Styling**: SCSS avec variables CSS
- **Security**: JWT Tokens, CryptoJS pour le chiffrement
- **State Management**: RxJS Observables
- **Routing**: Angular Router avec Guards

## 📦 Installation

### Prérequis
- Node.js 18+ et npm
- Angular CLI 17+

### Étapes d'installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Démarrer le serveur de développement**
```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

3. **Build pour la production**
```bash
npm run build
```

## 🔐 Sécurité

### Fonctionnalités de sécurité implémentées

1. **Authentification JWT**
   - Tokens stockés de manière sécurisée (chiffrés)
   - Expiration automatique des tokens
   - Intercepteur HTTP pour l'ajout automatique des tokens

2. **Chiffrement des données sensibles**
   - Utilisation de CryptoJS pour chiffrer les tokens et données utilisateur
   - Clé de chiffrement (à configurer via variable d'environnement en production)

3. **Guards de route**
   - Protection des routes nécessitant une authentification
   - Redirection automatique vers la page de connexion

4. **Validation des formulaires**
   - Validation côté client
   - Messages d'erreur clairs

## 📁 Structure du projet

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # Protection des routes
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    # Ajout automatique du token JWT
│   │   └── services/
│   │       ├── auth.service.ts        # Service d'authentification
│   │       └── investment.service.ts  # Service de gestion des investissements
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/                 # Page de connexion
│   │   │   └── register/              # Page d'inscription
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts # Tableau de bord principal
│   │   └── investments/
│   │       ├── investments-list/       # Liste des investissements
│   │       ├── investment-form/      # Formulaire création/édition
│   │       └── investment-detail/     # Détails d'un investissement
│   ├── app.component.ts
│   └── app.routes.ts
├── assets/                             # Ressources statiques
├── styles.scss                         # Styles globaux
└── index.html
```

## 🔌 Configuration API

L'application est configurée pour communiquer avec une API backend. Par défaut, l'URL de l'API est définie dans les services :

- `AuthService`: `http://localhost:3000/api`
- `InvestmentService`: `http://localhost:3000/api`

**Important**: Modifiez ces URLs selon votre configuration backend.

### Endpoints API attendus

#### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

#### Investissements
- `GET /api/investments` - Liste des investissements
- `GET /api/investments/:id` - Détails d'un investissement
- `POST /api/investments` - Créer un investissement
- `PUT /api/investments/:id` - Modifier un investissement
- `DELETE /api/investments/:id` - Supprimer un investissement
- `GET /api/investments/stats` - Statistiques du portefeuille

## 🌐 Internationalisation

L'interface est actuellement en français, adaptée pour la Guinée Conakry. Les devises supportées incluent le Franc guinéen (GNF).

## 📱 Responsive Design

L'application est entièrement responsive et s'adapte aux différentes tailles d'écran :
- Desktop
- Tablet
- Mobile

## 🔄 Prochaines étapes

### Phase 2 - Backend
- [ ] API REST sécurisée (Node.js/Express ou NestJS)
- [ ] Base de données (PostgreSQL/MongoDB)
- [ ] Authentification JWT côté serveur
- [ ] Validation et sanitization des données

### Phase 3 - Mobile App
- [ ] Application React Native ou Flutter
- [ ] Synchronisation avec l'API
- [ ] Notifications push
- [ ] Mode hors ligne

### Phase 4 - Fonctionnalités avancées
- [ ] Graphiques de performance
- [ ] Alertes et notifications
- [ ] Export de rapports (PDF)
- [ ] Intégration avec des APIs financières
- [ ] Analyse prédictive
- [ ] Portefeuille recommandé

## 🛡️ Bonnes pratiques de sécurité

### Pour la production

1. **Variables d'environnement**
   - Utilisez des variables d'environnement pour les clés de chiffrement
   - Ne commitez jamais les clés secrètes

2. **HTTPS**
   - Utilisez toujours HTTPS en production
   - Configurez des certificats SSL valides

3. **Validation serveur**
   - Ne faites jamais confiance aux données client
   - Validez toutes les entrées côté serveur

4. **Rate limiting**
   - Implémentez un rate limiting sur l'API
   - Protégez contre les attaques par force brute

5. **CORS**
   - Configurez correctement les en-têtes CORS
   - Limitez les origines autorisées

## 📝 Licence

Propriétaire - Neo Tech Investment

## 👥 Support

Pour toute question ou support, contactez l'équipe de développement.

---

**Note**: Cette application est en développement. Assurez-vous de tester toutes les fonctionnalités avant de déployer en production.


