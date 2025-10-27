# Identifiants Par Défaut - AfrikaPharma

## Accès au Système

Pour accéder aux différentes interfaces de AfrikaPharma, utilisez les identifiants suivants :

### 🔐 Identifiants par défaut

#### Administrateur
- **URL de connexion** : http://localhost:3001/login-admin
- **Nom d'utilisateur** : `admin`
- **Mot de passe** : `admin123`
- **Rôle** : Administrateur

#### Vendeur/Pharmacien
- **URL de connexion** : http://localhost:3001/login-seller
- **Nom d'utilisateur** : `vendeur`
- **Mot de passe** : `vendeur123`
- **Rôle** : Vendeur

### 🚀 Démarrage de l'application

1. Ouvrir un terminal dans le dossier du projet
2. Exécuter : `npm run dev`
3. L'application sera disponible sur : http://localhost:3001
4. Aller sur : http://localhost:3001/login-admin
5. Se connecter avec les identifiants ci-dessus

### ⚠️ Sécurité

**IMPORTANT** : Pour des raisons de sécurité, il est fortement recommandé de changer ces mots de passe par défaut après la première connexion.

### 🔄 Changer les mots de passe

1. Connectez-vous avec les identifiants par défaut (admin ou vendeur)
2. Allez dans les paramètres utilisateur
3. Changez le mot de passe
4. Utilisez un mot de passe fort (minimum 8 caractères avec chiffres et symboles)

### 🔧 Réinitialiser les identifiants

Si vous oubliez les mots de passe, vous pouvez recréer les utilisateurs par défaut :

```bash
node prisma/seed.js
```

Cela recréera les utilisateurs avec les mots de passe par défaut :
- **Admin** : `admin123`
- **Vendeur** : `vendeur123`

### 📋 Fonctionnalités par rôle

#### Administrateur
Une fois connecté comme administrateur, vous aurez accès à :
- Dashboard administrateur complet
- Gestion des médicaments (ajout, modification, suppression)
- Gestion des ventes et historique
- Gestion des utilisateurs (création vendeurs)
- Statistiques en temps réel
- Configuration système

#### Vendeur/Pharmacien  
Une fois connecté comme vendeur, vous aurez accès à :
- Dashboard vendeur simplifié
- Interface de vente rapide
- Recherche et vente de médicaments
- Scanner de codes-barres
- Gestion des clients
- Historique des ventes personnelles