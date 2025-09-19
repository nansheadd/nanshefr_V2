# Frontend Nanshe

Application React + Vite utilisée pour l'interface utilisateur de Nanshe. Le projet est désormais prêt pour un déploiement sur une plateforme comme [Fly.io](https://fly.io) ou n'importe quel hébergeur de fichiers statiques.

## 🚀 Mise en route

```bash
npm install
cp .env.example .env.local # puis complétez les variables
npm run dev
```

## 🔧 Scripts disponibles

- `npm run dev` : démarre le serveur de développement Vite.
- `npm run lint` : exécute ESLint sur l'ensemble du projet.
- `npm run build` : génère le bundle de production dans `dist/`.
- `npm run preview` : sert localement le build généré (utile pour tester le résultat final).

## 🔐 Variables d'environnement

Les variables commençant par `VITE_` sont injectées au moment du build. Utilisez le fichier `.env.example` comme point de départ.

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL de base de l'API. Laissez vide pour utiliser automatiquement l'origine du navigateur en production. | `http://localhost:8000` en développement | 
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe utilisée pour les parcours premium. | _aucune_ |

> ℹ️ Lors du build, si `VITE_API_BASE_URL` n'est pas définie et que l'application n'est pas servie depuis `localhost`, le frontend utilisera automatiquement l'origine actuelle (`https://votre-domaine`).

## 🧱 Build de production

```bash
npm run build
# Optionnel : vérifier le bundle localement
npm run preview
```

Le dossier `dist/` contient les fichiers statiques prêts à être servis par un CDN ou un simple serveur HTTP.

## 🐳 Docker & Fly.io

Un `Dockerfile` multi-étapes est fourni pour produire une image légère qui build l'application puis sert les fichiers statiques via [`serve`](https://www.npmjs.com/package/serve). Les variables d'environnement critiques (`VITE_API_BASE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`) sont exposées comme `--build-arg` afin d'être injectées pendant la compilation.

### Build et test local de l'image

```bash
docker build \
  -t nanshe-frontend \
  --build-arg VITE_API_BASE_URL="https://api.example.com" \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY="pk_live_xxx" \
  .

docker run -p 4173:4173 nanshe-frontend
```

L'application est alors disponible sur `http://localhost:4173`.

### Déploiement sur Fly.io

1. Initialisez l'application si nécessaire : `fly launch --no-deploy`.
2. Déployez en passant les variables au moment du build :
   ```bash
   fly deploy \
     --build-arg VITE_API_BASE_URL="https://api.example.com" \
     --build-arg VITE_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
   ```
3. Facultatif : stockez également ces valeurs en secret pour les prochains builds automatisés :
   ```bash
   fly secrets set \
     VITE_API_BASE_URL="https://api.example.com" \
     VITE_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
   ```

Fly utilisera le `Dockerfile` pour builder l'image, puis servira automatiquement le site sur le port `4173` (configuré dans le conteneur).

## ✅ Checklist avant mise en production

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Variables d'environnement renseignées
- [ ] Tests manuels réalisés sur `npm run preview`

Vous êtes prêt pour la mise en production !
