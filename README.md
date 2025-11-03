# PharmaSuite - Solution Générique de Gestion de Pharmacie# Admin Console (minimal scaffold)



## 📋 Vue d'ensembleThis is a minimal Next.js admin console scaffold intended to run alongside the main app.



PharmaSuite est une application de gestion de pharmacie transformée en solution générique et personnalisable. Elle permet à n'importe quelle pharmacie de configurer et utiliser le système selon ses besoins spécifiques.Ports

- Runs by default on port 3001 to avoid clashing with the main app.

## 🚀 Fonctionnalités Principales

Setup

### ✅ Configuration Dynamique1. From repository root, install root deps if needed:

- **Nom personnalisable** : Configurez le nom de votre pharmacie

- **Thème adaptatif** : Couleurs et apparence personnalisables   npm install

- **Données spécifiques** : Produits, horaires, et paramètres métier

- **Multi-devises** : Support de différentes devises2. Install admin-console deps and generate Prisma client against the shared schema:



### ✅ Assistant de Configuration   cd admin-console

- **Configuration guidée** : Assistant pas-à-pas pour la première installation   npm install

- **Validation intelligente** : Vérification automatique des données saisies   npx prisma generate --schema=../prisma/schema.prisma

- **Configuration modulaire** : Activez seulement les fonctionnalités nécessaires

3. Copy environment variables (example): create `.env.local` in `admin-console/` with: 

### ✅ Gestion Multi-Pharmacies

- **Console Super Administrateur** : Gestion centralisée de plusieurs pharmacies```

- **Basculement facile** : Changez de pharmacie en un clicDATABASE_URL="your_postgres_database_url"

- **Paramètres individuels** : Configuration indépendante pour chaque pharmacieNEXTAUTH_SECRET="some_long_random_value"

- **Statistiques globales** : Vue d'ensemble de toutes les pharmaciesOWNER_ID="cmfuwdvny0000wegwvcldxs27"

```

### ✅ Architecture Modulaire

- **Composants réutilisables** : Code structuré et maintenable4. Run dev server:

- **Ajout de fonctionnalités** : Extension facile sans impact sur l'existant

- **Configuration flexible** : Activation/désactivation des modules   npm run dev



## 🛠️ Installation et ConfigurationNotes

- The scaffold uses the shared Prisma schema at `../prisma/schema.prisma`. Ensure you run `npx prisma generate --schema=../prisma/schema.prisma` from `admin-console/` after installing deps.

### Prérequis- This app is a minimal MVP to test super-admin flows. Harden auth (2FA) and secure environment before production.

- Node.js 18+ 
- npm ou yarn
- Base de données PostgreSQL

### Installation
```bash
# Cloner le projet
git clone [repository-url]
cd admin-console

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Lancer l'application
npm run dev
```

### Première Configuration
1. **Accéder à l'application** : Ouvrez http://localhost:3001
2. **Lancer l'assistant** : Cliquez sur "Commencer la configuration"
3. **Suivre les étapes** :
   - Informations de base (nom, identité)
   - Coordonnées (adresse, contact)
   - Configuration métier (horaires, TVA)
   - Fonctionnalités (modules à activer)
   - Finalisation

## 📁 Structure du Projet

```
admin-console/
├── 📂 app/                    # Pages Next.js
│   ├── 📂 api/
│   │   ├── 📂 config/         # API de configuration
│   │   └── 📂 pharmacies/     # API de gestion des pharmacies
│   ├── 📂 setup/              # Assistant de configuration
│   └── 📂 dashboard/          # Tableau de bord
├── 📂 components/             # Composants réutilisables
│   └── PharmacyManager.tsx    # Gestionnaire de pharmacies
├── 📂 lib/                    # Bibliothèques et utilitaires
│   └── config.ts              # Système de configuration
├── 📂 config/                 # Fichiers de configuration
│   └── app-config.json        # Configuration de l'application
└── 📂 prisma/                 # Base de données
    └── schema.prisma          # Schéma de base
```

## ⚙️ Configuration

### Configuration Basique
```typescript
// Exemple de configuration d'une pharmacie
const pharmacyConfig: PharmacyConfig = {
  name: "Pharmacie Centrale",
  shortName: "Centrale",
  theme: {
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981"
  },
  contact: {
    address: "123 Rue de la Paix, 75001 Paris",
    phone: "+33 1 23 45 67 89",
    email: "contact@pharmacie-centrale.fr"
  },
  features: {
    inventory: true,
    sales: true,
    clients: true,
    reports: true,
    prescriptions: true,
    multiLocation: false
  }
}
```

## 🔧 Personnalisation

### Ajouter de Nouvelles Fonctionnalités

1. **Étendre l'interface de configuration** :
```typescript
// Dans lib/config.ts
interface PharmacyConfig {
  // ... propriétés existantes
  newFeature: {
    enabled: boolean;
    settings: any;
  };
}
```

2. **Créer le composant** :
```typescript
// components/NewFeature.tsx
export const NewFeature: React.FC = () => {
  // Logique du composant
};
```

## 👥 Gestion Multi-Pharmacies

### Console Super Administrateur
- **Vue d'ensemble** : Aperçu de toutes les pharmacies configurées
- **Gestion individuelle** : Configuration spécifique par pharmacie
- **Statistiques globales** : Métriques consolidées
- **Basculement rapide** : Changement de contexte facilité

## 🆘 Support et Dépannage

### Problèmes Courants

**L'assistant de configuration ne s'affiche pas**
- Vérifiez que l'API de configuration fonctionne
- Consultez les logs du navigateur

**Erreur lors de la sauvegarde**
- Vérifiez les permissions d'écriture
- Contrôlez la connexion à la base de données

### Commandes Utiles
```bash
# Réinitialiser la configuration
npm run reset-config

# Sauvegarder la configuration
npm run backup-config

# Valider la configuration
npm run validate-config
```

---

**PharmaSuite** - *Configurez une fois, utilisez partout* 💊✨