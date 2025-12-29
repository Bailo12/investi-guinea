# Guide de démarrage rapide

## Installation rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Démarrer l'application
```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

## Configuration

### Configuration de l'API Backend

Avant de pouvoir utiliser l'application, vous devez configurer l'URL de votre API backend.

1. Ouvrez `src/environments/environment.ts`
2. Modifiez `apiUrl` avec l'URL de votre API backend

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // Votre URL API
};
```

### Configuration de la clé de chiffrement

Pour la production, modifiez la clé de chiffrement dans `src/app/core/services/auth.service.ts`:

```typescript
private readonly ENCRYPTION_KEY = 'votre-cle-secrete-tres-longue-et-securisee';
```

**Important**: Utilisez une variable d'environnement en production !

## Structure des routes

- `/auth/login` - Page de connexion
- `/auth/register` - Page d'inscription
- `/dashboard` - Tableau de bord (protégé)
- `/investments` - Liste des investissements (protégé)
- `/investments/new` - Créer un investissement (protégé)
- `/investments/:id` - Détails d'un investissement (protégé)
- `/investments/:id/edit` - Modifier un investissement (protégé)

## Test de l'application

### Sans backend (mode développement)

L'application est configurée pour fonctionner avec un backend. Pour tester sans backend:

1. Les appels API échoueront, mais l'interface sera fonctionnelle
2. Vous pouvez utiliser les outils de développement du navigateur pour simuler des réponses API

### Avec backend

Assurez-vous que votre backend implémente les endpoints suivants:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/investments`
- `GET /api/investments/:id`
- `POST /api/investments`
- `PUT /api/investments/:id`
- `DELETE /api/investments/:id`
- `GET /api/investments/stats`

## Dépannage

### Erreur: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur: Port déjà utilisé
```bash
ng serve --port 4201
```

### Erreur: TypeScript
```bash
npm install -g typescript@latest
```

## Prochaines étapes

1. Configurer votre backend API
2. Tester l'authentification
3. Ajouter des investissements de test
4. Personnaliser le design selon vos besoins
5. Déployer en production

## Support

Consultez le README.md pour plus d'informations détaillées.


