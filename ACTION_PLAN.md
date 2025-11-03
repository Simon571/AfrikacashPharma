# 🎯 Plan d'Action - Séparation Console Admin et AfrikaPharma

## 📊 État actuel

### ✅ Complété
- [x] Console Admin (branch main) - Créée et déployée
  - URL: https://console-afrikapharma.vercel.app
  - Vercel Project: console-afrikapharma
  
- [x] AfrikaPharma App - Déjà en production
  - URL: https://afrikapharma.vercel.app
  - Vercel Project: afrikapharma

- [x] Structure de dossiers créée
  - app/admin/* (Console Admin)
  - app/api/admin/* (API Admin)
  - lib/services/admin/* (Services Admin)

### ⏳ À faire

---

## 🚀 Étape 1: Créer la branche `afrikapharma` 

**Objectif**: Créer une branche dédiée pour l'application AfrikaPharma

```bash
# 1. Depuis la Console Afrikapharma (racine)
cd "c:\Users\Public\Documents\Console Afrikapharma"

# 2. Créer une branche orpheline (sans historique)
git checkout --orphan afrikapharma
git reset --hard

# 3. Effacer tous les fichiers
rm -r app lib config types middleware.ts package.json tsconfig.json vercel.json

# 4. Copier le contenu de AfrikaPharma/src
copy "AfrikaPharma\src\*" "." -Recurse

# 5. Configurer le package.json pour AfrikaPharma
# (Éditer le nom et les scripts)

# 6. Ajouter et committer
git add .
git commit -m "Initial AfrikaPharma app from src/"

# 7. Pousser la branche
git push -u origin afrikapharma
```

---

## 📋 Étape 2: Configurer Vercel pour la branche `afrikapharma`

**Dans Vercel Dashboard**:

1. Aller sur le projet **afrikapharma**
2. Settings → Git Integration
3. Vérifier/Modifier:
   - **Production Branch**: `afrikapharma` (au lieu de `main`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Framework**: Next.js
4. Sauvegarder

**Vérifier les variables d'environnement** (Vercel → Settings → Environment Variables):
```
✓ DATABASE_URL
✓ NEXTAUTH_SECRET
✓ NEXTAUTH_URL=https://afrikapharma.vercel.app
```

---

## 📋 Étape 3: Revenir à la branche `main` (Console)

```bash
# Revenir à main
git checkout main

# Vérifier que nous sommes sur la bonne branche
git branch
# Résultat: * main
#           afrikapharma
```

**La Console Admin doit continuer à déployer depuis `main`**

---

## 🔄 Étape 4: Tester les deux déploiements

### Test Console Admin
```bash
# 1. Assurer que nous sommes sur main
git checkout main

# 2. Faire une petite modification
echo "# Console Test" >> README_CONSOLE.md

# 3. Committer et pousser
git add README_CONSOLE.md
git commit -m "Test: Console deployment"
git push origin main

# 4. Vérifier Vercel
# → Aller sur console-afrikapharma.vercel.app
# → Vérifier que le déploiement est en cours
```

### Test AfrikaPharma
```bash
# 1. Basculer sur afrikapharma
git checkout afrikapharma

# 2. Faire une petite modification
echo "# App Test" >> README.md

# 3. Committer et pousser
git add README.md
git commit -m "Test: App deployment"
git push origin afrikapharma

# 4. Vérifier Vercel
# → Aller sur afrikapharma.vercel.app
# → Vérifier que le déploiement est en cours
```

---

## 🔐 Étape 5: Configurer l'authentification séparée

### Pour Console Admin (main - branch)

**Fichier**: `app/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Configuration admin uniquement
const handler = NextAuth({
  providers: [
    Credentials({
      authorize: async (credentials) => {
        // Vérifier que l'utilisateur a un rôle admin
        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (user && ['superadmin', 'admin', 'supervisor'].includes(user.role)) {
          return { id: user.id, email: user.email, role: user.role };
        }
        return null;
      }
    })
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      const adminRoles = ['superadmin', 'admin', 'supervisor'];
      return auth?.user?.role && adminRoles.includes(auth.user.role);
    }
  }
});

export { handler as GET, handler as POST };
```

### Pour AfrikaPharma (afrikapharma branch)

**Fichier**: `src/app/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Configuration app uniquement
const handler = NextAuth({
  providers: [
    Credentials({
      authorize: async (credentials) => {
        // Vérifier que l'utilisateur n'a PAS un rôle admin
        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (user && !['superadmin', 'admin', 'supervisor'].includes(user.role)) {
          return { id: user.id, email: user.email, role: user.role };
        }
        return null;
      }
    })
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      const appRoles = ['seller', 'pharmacist', 'customer'];
      return auth?.user?.role && appRoles.includes(auth.user.role);
    }
  }
});

export { handler as GET, handler as POST };
```

---

## 🗄️ Étape 6: Optimiser la base de données

**Vérifier que les deux apps partagent le même DATABASE_URL**:

```bash
# Console Admin - .env.production
DATABASE_URL=postgresql://...

# AfrikaPharma - .env.production (même URL)
DATABASE_URL=postgresql://...
```

**Vérifier le schéma Prisma est compatible**:
```bash
# Depuis la Console Admin
npx prisma migrate status

# Les migrations doivent être synchronisées
```

---

## 📱 Étape 7: Configurer la communication Console ↔ App

### Variables d'environnement - Console Admin

```env
# .env.production
CONSOLE_URL=https://console-afrikapharma.vercel.app
AFRIKAPHARMA_APP_URL=https://afrikapharma.vercel.app
API_INTERNAL_TOKEN=secret_token_ici
```

### Variables d'environnement - AfrikaPharma

```env
# .env.production
ADMIN_CONSOLE_URL=https://console-afrikapharma.vercel.app
API_INTERNAL_TOKEN=secret_token_ici
```

---

## ✅ Checklist finale

- [ ] Branche `afrikapharma` créée et poussée
- [ ] Vercel configuré pour la branche `afrikapharma`
- [ ] Console Admin déploie depuis `main`
- [ ] AfrikaPharma App déploie depuis `afrikapharma`
- [ ] Authentification séparée configurée
- [ ] Variables d'environnement synchronisées
- [ ] Tests de déploiement réussis
- [ ] Communication Console ↔ App fonctionnelle
- [ ] Documentation mise à jour

---

## 🎯 Résultat final

```
Console Admin:
✓ https://console-afrikapharma.vercel.app
✓ Rôles: superadmin, admin, supervisor
✓ Gère tous les utilisateurs et données
✓ Branch: main
✓ Déploie automatiquement

AfrikaPharma App:
✓ https://afrikapharma.vercel.app
✓ Rôles: seller, pharmacist, customer
✓ Données filtrées par utilisateur
✓ Branch: afrikapharma
✓ Déploie automatiquement

Base de données:
✓ PostgreSQL partagée
✓ Schéma Prisma unique
✓ Migrations synchronisées
```

---

## 📞 Support

Pour des questions ou problèmes:
1. Vérifier les logs Vercel
2. Vérifier les variables d'environnement
3. Vérifier la branche active
4. Vérifier la base de données

