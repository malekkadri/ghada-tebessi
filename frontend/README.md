# PFE-FrontEnd

Ce projet est le frontend de l'application PFE, développé avec React, TypeScript et Vite.

## Technologies utilisées

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Headless UI
- Framer Motion
- React Toastify

## Fonctionnalités

- Authentification (connexion, inscription, récupération de mot de passe)
- Gestion des vCards
- Gestion des blocs
- Gestion des projets
- Gestion des notifications
- Gestion des abonnements et paiements
- Interface responsive (mobile, tablette, desktop)

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/PFE-FrontEnd.git

# Accéder au répertoire du projet
cd PFE-FrontEnd

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Structure du projet

- `src/` - Code source de l'application
  - `assets/` - Ressources statiques (images, styles, etc.)
  - `components/` - Composants réutilisables
  - `pages/` - Pages de l'application
  - `services/` - Services pour les appels API
  - `hooks/` - Hooks personnalisés
  - `utils/` - Fonctions utilitaires
  - `template front/` - Templates pour l'interface utilisateur
  - `templateBack/` - Templates pour l'interface d'administration

## Configuration ESLint

Ce projet utilise ESLint pour la qualité du code. Pour activer les règles de vérification de type :

```js
export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
