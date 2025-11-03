# Stratégie de Déploiement : Console + AfrikaPharma

## 📍 État actuel

### Projets Vercel existants
1. **console-afrikapharma** (Nouvellement créé)
   - URL: https://console-afrikapharma.vercel.app
   - Branche: `main`
   - Status: En cours de configuration

2. **afrikapharma** (Déjà déployé)
   - URL: https://afrikapharma.vercel.app
   - Branche: À confirmer (probablement `main` ou dédiée)
   - Status: ✅ En production

---

## 🎯 Stratégie proposée

### Approche 1: Deux branches dans le même repo (RECOMMANDÉE)

```
Repository: AfrikacashPharma
│
├── main (Branch Console Admin)
│   ├── /app/admin/*              # Pages admin
│   ├── /app/api/admin/*          # API admin
│   ├── /lib/services/admin/      # Services admin
│   ├── /config/console.config.ts
│   ├── package.json
│   ├── next.config.js
│   └── vercel.json               # Config Console
│   
│   ✓ Déploie automatiquement sur: console-afrikapharma.vercel.app
│
│
└── afrikapharma (Branch Application)
    ├── /src/app/dashboard/*      # Pages utilisateurs
    ├── /src/app/api/*            # API application
    ├── /src/lib/services/        # Services métier
    ├── /src/config/app.config.ts
    ├── package.json
    ├── next.config.ts
    ├── vercel.json               # Config AfrikaPharma
    └── AfrikaPharma/             # Code existant (deprecated)
    
    ✓ Déploie automatiquement sur: afrikapharma.vercel.app
```

---

## 🔀 Configuration des branches

### Branch: `main` (Console Admin)
```bash
# Contenu actuel de la racine
# C'est la Console d'administration
```

**Vercel Webhook Configuration**:
- Project: `console-afrikapharma`
- Branch: `main`
- Production Branch: `main`

---

### Branch: `afrikapharma` (Application existante)
```bash
# Dossier: AfrikaPharma/src -> Racine de cette branche
# C'est l'application pour utilisateurs
```

**Vercel Webhook Configuration**:
- Project: `afrikapharma`
- Branch: `afrikapharma`
- Production Branch: `afrikapharma`

---

## 📦 Création de la branche `afrikapharma`

### Étape 1: Créer la branche depuis le dossier existant

```bash
# Dans la Console Afrikapharma
cd "c:\Users\Public\Documents\Console Afrikapharma"

# Créer une branche afrikapharma
git checkout --orphan afrikapharma
git reset --hard

# Copier le contenu de AfrikaPharma/src à la racine
# (à faire manuellement ou via script)

git add .
git commit -m "Initial AfrikaPharma app content from src/"
git push -u origin afrikapharma
```

---

## 🗂️ Structure finale des deux branches

### Branch `main` (Console Admin)
```
Console Afrikapharma/
├── app/
│   ├── admin/dashboard
│   ├── admin/users
│   ├── admin/sales
│   ├── api/admin/
│   └── auth/
├── lib/services/admin/
├── config/console.config.ts
├── middleware.ts (pour admin)
├── next.config.js
├── tsconfig.json
└── package.json (Console)
```

### Branch `afrikapharma` (Application)
```
AfrikaPharma/
├── src/app/
│   ├── dashboard/sales
│   ├── dashboard/inventory
│   ├── dashboard/orders
│   ├── api/sales
│   ├── api/medications
│   └── auth/
├── src/lib/services/
├── src/config/app.config.ts
├── src/middleware.ts (pour app)
├── next.config.ts
├── tsconfig.json
└── package.json (AfrikaPharma)
```

---

## 🔗 Communication entre les deux

### Variables d'environnement partagées

**Console (.env.production)**:
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://console-afrikapharma.vercel.app

# Référence à l'app
AFRIKAPHARMA_APP_URL=https://afrikapharma.vercel.app
```

**AfrikaPharma (.env.production)**:
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://afrikapharma.vercel.app

# Référence à la console (optionnel)
ADMIN_CONSOLE_URL=https://console-afrikapharma.vercel.app
```

---

## 🚀 Workflows de déploiement

### Workflow 1: Modification Console Admin
```
1. Développement local sur branche `main`
2. Push sur origin/main
3. GitHub webhook → Vercel déclenche build
4. Build successful → Déploie sur console-afrikapharma.vercel.app
```

### Workflow 2: Modification AfrikaPharma App
```
1. Développement local sur branche `afrikapharma`
2. Push sur origin/afrikapharma
3. GitHub webhook → Vercel déclenche build
4. Build successful → Déploie sur afrikapharma.vercel.app
```

---

## 📋 Configuration Vercel actuelle à vérifier

### Pour console-afrikapharma
```bash
# Vérifier dans Vercel Dashboard:
✓ Project: console-afrikapharma
✓ Framework: Next.js
✓ Root Directory: ./
✓ Build Command: npm run build
✓ Output Directory: .next
✓ Production Branch: main
✓ Auto-deploy: On
```

### Pour afrikapharma
```bash
# Vérifier dans Vercel Dashboard:
✓ Project: afrikapharma
✓ Framework: Next.js
✓ Root Directory: ./AfrikaPharma/ (ou racine si on crée branche)
✓ Build Command: npm run build
✓ Output Directory: .next
✓ Production Branch: main (À confirmer)
✓ Auto-deploy: On
```

---

## ⚠️ Points importants

### 1. Base de données partagée
- Les deux apps utilisent la MÊME `DATABASE_URL`
- Le schéma Prisma doit être compatible
- Les migrations se font une seule fois

### 2. Authentification séparée
- Console: Rôles admin (superadmin, admin, supervisor)
- App: Rôles utilisateurs (seller, pharmacist, customer)
- Tokens/Sessions ne se mélangent pas

### 3. Sécurité
- Console protégée par RBAC strict
- App restreinte aux données de l'utilisateur
- API Admin distincte de l'API App

### 4. Versioning
- Chaque branche a son package.json indépendant
- Dépendances peuvent différer
- Versions Next.js peuvent être différentes

---

## ✅ Checklist de mise en place

- [ ] Créer la branche `afrikapharma`
- [ ] Copier le contenu de `AfrikaPharma/src` à la racine de cette branche
- [ ] Configurer Vercel webhook pour la branche `afrikapharma`
- [ ] Tester le déploiement de la branche `afrikapharma`
- [ ] Vérifier que console-afrikapharma se déploie depuis `main`
- [ ] Configurer les variables d'environnement séparées
- [ ] Tester la communication Console ↔ App
- [ ] Ajouter un script de synchronisation des données
