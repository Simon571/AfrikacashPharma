# 🔧 ERREUR: Table `public.Sale` n'existe pas

## ❌ Le Problème

```
PrismaClientKnownRequestError: 
The table `public.Sale` does not exist in the current database.
```

## 🔍 La Cause

**La base de données Neon EST maintenant accessible**, mais **le schéma n'a pas été créé**. Il faut créer les tables avec les migrations Prisma.

---

## ✅ SOLUTIONS

### **Solution 1: Exécuter les migrations (RECOMMANDÉ)**

Dans le répertoire AfrikaPharma:

```bash
cd AfrikaPharma

# Option A: Appliquer les migrations existantes
npx prisma migrate deploy

# Option B: Si vous êtes en développement (réinitialise la BD)
npx prisma migrate reset --force

# Option C: Créer et appliquer une nouvelle migration
npx prisma migrate dev --name init
```

Résultat attendu:
```
✅ Database migrated
```

### **Solution 2: Créer les tables directement**

```bash
cd AfrikaPharma

# Envoyer le schéma à la BD
npx prisma db push
```

### **Solution 3: Réinitialiser et remplir avec données**

```bash
cd AfrikaPharma

# Réinitialiser complètement
npx prisma migrate reset --force

# Seed (si disponible)
npm run db:seed
```

---

## 📋 Étapes Recommandées

### Étape 1: Vérifier la BD Neon
```bash
# Vérifier que la connexion fonctionne
npx prisma db execute --stdin
# Puis tapez: SELECT 1;
# Appuyez sur Ctrl+D
```

### Étape 2: Exécuter les migrations
```bash
cd AfrikaPharma
npx prisma migrate deploy
```

### Étape 3: Vérifier les tables
```bash
# Lister les tables
npx prisma db execute --stdin
# Puis: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### Étape 4: Redémarrer l'app
```bash
npm run dev
```

---

## 🔧 Si Les Migrations N'existent Pas

### Vérifier le dossier migrations
```
AfrikaPharma/prisma/migrations/
├── 20240101123456_init/
│   └── migration.sql
├── 20240102123456_add_users/
│   └── migration.sql
└── ...
```

### Si vide, créer une migration
```bash
cd AfrikaPharma

# Créer une nouvelle migration basée sur le schema.prisma
npx prisma migrate dev --name init
```

---

## 📊 Schéma de la BD

AfrikaPharma a besoin de ces tables:
- ✅ `User` - Utilisateurs
- ✅ `Sale` - Ventes
- ✅ `SaleItem` - Détail des ventes
- ✅ `Medication` - Médicaments
- ✅ `Client` - Clients
- ✅ `Expense` - Dépenses

Le fichier `prisma/schema.prisma` définit le schéma complet.

---

## ✨ Résultat Attendu

Après les migrations:
```
✅ Table `public.User` créée
✅ Table `public.Sale` créée
✅ Table `public.SaleItem` créée
✅ Table `public.Medication` créée
✅ Table `public.Client` créée
✅ Table `public.Expense` créée
```

L'app AfrikaPharma affichera alors:
- ✅ Dashboard avec stats
- ✅ Pas d'erreur PrismaClientKnownRequestError
- ✅ Toutes les requêtes BD fonctionnent

---

## 🚀 Commandes Rapides

```bash
cd AfrikaPharma

# Vérifier le statut
npx prisma migrate status

# Appliquer les migrations
npx prisma migrate deploy

# Voir les tables créées
npx prisma studio  # Interface visuelle

# Réinitialiser (dev seulement!)
npx prisma migrate reset --force
```

---

## 📝 Fichier de Configuration

**`AfrikaPharma/prisma/schema.prisma`** - Définit toutes les tables

**`AfrikaPharma/.env.local`** - Connexion Neon
```
DATABASE_URL="postgresql://..."
```

---

## ✅ CHECKLIST

- [ ] Connexion Neon fonctionne
- [ ] Migrations appliquées avec `npx prisma migrate deploy`
- [ ] Tables créées dans la BD
- [ ] App relancée: `npm run dev`
- [ ] Dashboard chargé sans erreur
- [ ] Stats affichées

---

## 🎯 PROCHAINES ÉTAPES

1. **Exécutez:** `cd AfrikaPharma && npx prisma migrate deploy`
2. **Relancez:** `npm run dev`
3. **Testez:** http://localhost:3000/login-admin

C'est tout! La BD sera correctement initialisée. 🎉
