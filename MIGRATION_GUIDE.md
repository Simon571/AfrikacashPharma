# Guide de Migration - Suppression des Références "Pajo-Pharma"

## 🎯 Objectif
Ce guide détaille comment supprimer complètement toutes les références à "Pajo-Pharma" de l'application pour la rendre entièrement générique.

## 📍 Emplacements à Modifier

### 1. Schéma de Base de Données
**Fichier**: `prisma/schema.prisma`
- ✅ Aucune référence trouvée dans le schéma
- ✅ Le schéma est déjà générique

### 2. Configuration du Projet
**Fichier**: `package.json`
```json
{
  "name": "pharmacy-admin-console", // Changé de "admin-console"
  "description": "Generic pharmacy management system"
}
```

### 3. Métadonnées de l'Application
**Fichier**: `app/layout.tsx`
```tsx
export const metadata = {
  title: 'PharmaSuite - Gestion de Pharmacie',
  description: 'Solution générique de gestion pour pharmacies',
}
```

### 4. Pages et Composants
- ✅ `app/page.tsx` - Déjà mis à jour avec PharmaSuite
- ✅ `app/dashboard/page.tsx` - Mis à jour avec configuration dynamique
- ✅ `app/setup/page.tsx` - Assistant générique créé

### 5. Configuration Dynamique
**Fichier**: `lib/config.ts`
- ✅ Système de configuration dynamique créé
- ✅ Permet de personnaliser le nom de l'application
- ✅ Gestion de plusieurs pharmacies

## 🔧 Actions de Nettoyage Automatique

### Script de Recherche et Remplacement
Exécutez ces commandes pour identifier les dernières références :

```bash
# Rechercher toutes les occurrences de "Pajo" ou "pajo"
grep -r -i "pajo" . --exclude-dir=node_modules --exclude-dir=.next

# Rechercher toutes les occurrences de "Pajo-Pharma"
grep -r -i "pajo-pharma" . --exclude-dir=node_modules --exclude-dir=.next
```

### Remplacement Automatique
```bash
# Remplacer dans tous les fichiers (à adapter selon les besoins)
find . -name "*.tsx" -o -name "*.ts" -o -name "*.json" | xargs sed -i 's/Pajo-Pharma/PharmaSuite/g'
find . -name "*.tsx" -o -name "*.ts" -o -name "*.json" | xargs sed -i 's/pajo-pharma/pharma-suite/g'
```

## 📋 Checklist de Vérification

### ✅ Fichiers Déjà Nettoyés
- [x] `app/page.tsx` - Page d'accueil générique
- [x] `app/dashboard/page.tsx` - Dashboard avec configuration dynamique
- [x] `app/setup/page.tsx` - Assistant de configuration
- [x] `lib/config.ts` - Système de configuration
- [x] `components/PharmacyManager.tsx` - Gestionnaire de pharmacies
- [x] `README.md` - Documentation mise à jour

### 🔍 Fichiers à Vérifier Manuellement
- [ ] `app/layout.tsx` - Métadonnées
- [ ] `package.json` - Nom et description du projet
- [ ] `prisma/schema.prisma` - Commentaires éventuels
- [ ] Tous les fichiers dans `app/api/` - Routes API
- [ ] Images et assets (logos, favicon)
- [ ] Fichiers de configuration (next.config.js, tailwind.config.js)

### 🗂️ Dossiers à Examiner
- [ ] `app/api/admin/` - Routes d'administration
- [ ] `app/clients/` - Gestion des clients
- [ ] `app/licenses/` - Gestion des licences
- [ ] `app/subscriptions/` - Gestion des abonnements
- [ ] `app/trials/` - Gestion des essais
- [ ] `pages/api/` - API Pages Router (si utilisé)

## 🔄 Processus de Migration Étape par Étape

### Étape 1 : Sauvegarde
```bash
# Créer une sauvegarde avant migration
git add .
git commit -m "Sauvegarde avant migration vers solution générique"
```

### Étape 2 : Mise à Jour des Métadonnées
```tsx
// app/layout.tsx
export const metadata = {
  title: 'PharmaSuite - Solution de Gestion',
  description: 'Plateforme générique de gestion pour pharmacies',
}
```

### Étape 3 : Configuration du Projet
```json
// package.json
{
  "name": "pharma-suite",
  "description": "Generic pharmacy management platform",
  "keywords": ["pharmacy", "management", "healthcare", "generic"]
}
```

### Étape 4 : Mise à Jour des Constantes
```typescript
// lib/constants.ts (à créer si nécessaire)
export const APP_CONFIG = {
  defaultName: 'PharmaSuite',
  defaultTitle: 'Solution de Gestion de Pharmacie',
  version: '1.0.0',
  supportedLanguages: ['fr', 'en'],
  defaultCurrency: 'EUR'
};
```

### Étape 5 : Mise à Jour de la Base de Données
Si des données existent déjà :
```sql
-- Exemple de script de migration (à adapter)
UPDATE "Configuration" SET "appName" = 'PharmaSuite' WHERE "appName" = 'Pajo-Pharma';
```

### Étape 6 : Tests et Validation
```bash
# Vérifier que l'application fonctionne
npm run dev

# Tester l'assistant de configuration
# Ouvrir http://localhost:3001 et vérifier que tout fonctionne
```

## 📝 Configuration Post-Migration

### 1. Première Configuration
Après la migration, la première visite de l'application affichera :
- Page d'accueil générique
- Assistant de configuration
- Possibilité de personnaliser le nom et l'apparence

### 2. Configuration Multiple
L'application supporte maintenant :
- Plusieurs pharmacies avec des configurations distinctes
- Thèmes personnalisables par pharmacie
- Gestion centralisée via la console super admin

### 3. Personnalisation Continue
Les utilisateurs peuvent :
- Modifier le nom de leur pharmacie à tout moment
- Ajuster les couleurs et l'apparence
- Activer/désactiver des fonctionnalités selon leurs besoins

## 🚨 Points d'Attention

### Données Existantes
- Sauvegarder toutes les données avant migration
- Créer des scripts de migration pour les données existantes
- Tester sur un environnement de développement en premier

### Compatibilité
- Vérifier que tous les modules fonctionnent avec la nouvelle configuration
- Tester l'import/export de données
- Valider l'authentification et les permissions

### Documentation
- Mettre à jour toute la documentation
- Créer des guides utilisateur pour la nouvelle interface
- Former les utilisateurs sur les nouvelles fonctionnalités

## ✅ Validation Finale

### Tests Fonctionnels
- [ ] Page d'accueil affiche "PharmaSuite" par défaut
- [ ] Assistant de configuration fonctionne
- [ ] Création de nouvelle pharmacie fonctionne
- [ ] Dashboard s'adapte à la pharmacie sélectionnée
- [ ] Toutes les fonctionnalités existantes marchent

### Tests de Configuration
- [ ] Possibilité de changer le nom de l'application
- [ ] Thèmes personnalisables fonctionnent
- [ ] Multi-pharmacies opérationnel
- [ ] Sauvegarde/restauration de configuration

### Tests d'Intégration
- [ ] Base de données compatible
- [ ] API fonctionnelle
- [ ] Authentification préservée
- [ ] Migrations de données réussies

---

**Félicitations !** 🎉 Votre application est maintenant entièrement générique et peut être utilisée par n'importe quelle pharmacie sans modifications du code.