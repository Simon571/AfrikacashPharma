# Architecture Multi-Projets : Console Admin + Application Principale

## 📊 Vue d'ensemble

```
AfrikacashPharma (Repository)
│
├─ Console Afrikapharma (Branch: main, Vercel: console-afrikapharma.vercel.app)
│  └─ Outil d'administration supervisée
│
└─ AfrikaPharma (Branch: afrikapharma, Vercel: afrikapharma.vercel.app)
   └─ Application principale pour utilisateurs
```

## 🏗️ Structure des deux projets

### 1. CONSOLE AFRIKAPHARMA (Racine actuelle)
**URL**: https://console-afrikapharma.vercel.app

```
Console Afrikapharma/
├── app/
│   ├── admin/                    # Pages d'administration
│   │   ├── dashboard/           # Dashboard superviseur
│   │   ├── users/               # Gestion des utilisateurs
│   │   ├── sales/               # Visualisation des ventes globales
│   │   └── analytics/           # Analytics et rapports
│   ├── api/
│   │   ├── admin/               # API administration
│   │   │   ├── users
│   │   │   ├── sales
│   │   │   ├── audit
│   │   │   └── statistics
│   │   └── auth/
│   └── login/                   # Login admin
│
├── lib/
│   ├── services/
│   │   ├── admin.service.ts
│   │   ├── user-management.service.ts
│   │   ├── analytics.service.ts
│   │   └── audit.service.ts
│   └── prisma.ts                # Client DB partagée
│
├── middleware.ts                # Auth + RBAC
├── next.config.js               # Config Next.js
└── package.json
```

**Rôles autorisés**:
- `superadmin`: Accès complet
- `admin`: Accès gestion
- `supervisor`: Accès lecture/rapport

---

### 2. AFRIKAPHARMA (Dossier séparé)
**URL**: https://afrikapharma.vercel.app

```
AfrikaPharma/
├── src/
│   ├── app/
│   │   ├── dashboard/           # Dashboard utilisateur
│   │   │   ├── sales/          # Ventes (vendeur)
│   │   │   ├── inventory/      # Inventaire (pharmacien)
│   │   │   └── orders/         # Commandes (client)
│   │   ├── api/
│   │   │   ├── sales
│   │   │   ├── medications
│   │   │   ├── inventory
│   │   │   └── profile
│   │   ├── auth/               # Login utilisateur
│   │   └── layout.tsx
│   │
│   ├── lib/
│   │   ├── services/
│   │   │   ├── sales.service.ts
│   │   │   ├── medications.service.ts
│   │   │   └── user-profile.service.ts
│   │   ├── hooks/
│   │   └── prisma.ts           # Client DB partagée
│   │
│   ├── components/             # Composants partagés
│   ├── types/
│   └── middleware.ts           # Auth + Permissions utilisateur
│
├── prisma/                      # Lien vers DB partagée
├── next.config.ts
└── package.json
```

**Rôles autorisés**:
- `seller`: Ventes et inventaire
- `pharmacist`: Médicaments et stock
- `customer`: Commandes et profil
- `admin`: Accès gestion (superviseur dans app)

---

## 🔄 Communication entre Console et App

### Données partagées via DB unique
```env
DATABASE_URL=postgresql://...  # Même DB pour les deux
```

### API interne (Console -> App données)
**Console peut lire/modifier** via API:
```
GET    /api/admin/users           → Récupère tous les utilisateurs
GET    /api/admin/sales           → Récupère toutes les ventes
PUT    /api/admin/users/[id]      → Modifie un utilisateur
```

**App consomme ses propres données**:
```
GET    /api/sales?userId=[id]     → Ventes de l'utilisateur
POST   /api/sales                 → Crée une vente
GET    /api/medications           → Liste des médicaments
```

---

## 🔐 Authentification séparée

### Console Admin
- Endpoint: `/api/auth/[...nextauth]` (Console)
- Rôles: superadmin, admin, supervisor
- Session: Token séparé
- Middleware: Vérifie rôle admin

### AfrikaPharma App
- Endpoint: `/api/auth/[...nextauth]` (App - lien symbolique ou fork)
- Rôles: seller, pharmacist, customer
- Session: Token séparé
- Middleware: Vérifie rôle utilisateur

---

## 📋 Base de données partagée

### Schéma Prisma unique
```prisma
model User {
  id           String
  email        String    @unique
  role         String    // "admin", "seller", "pharmacist", "customer"
  instance     Instance? // Pour multi-tenant futur
  createdAt    DateTime
  updatedAt    DateTime
}

model Sale {
  id           String
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  amount       Float
  date         DateTime
  createdAt    DateTime
}

model Medication {
  id           String
  name         String
  price        Float
  stock        Int
  createdAt    DateTime
}
```

---

## 🚀 Déploiement

### Console Admin
```bash
# Repository: AfrikacashPharma
# Branch: main
# Vercel Project: console-afrikapharma

npm run build
npm start
```

**Vercel Webhook**: Déploie automatiquement depuis `main`

### AfrikaPharma App
```bash
# Repository: AfrikacashPharma
# Branch: afrikapharma
# Vercel Project: afrikapharma

cd AfrikaPharma
npm run build
npm start
```

**Vercel Webhook**: Déploie automatiquement depuis `afrikapharma`

---

## 📱 Cas d'usage

### Scénario 1: Superviseur gère les ventes
1. Accède à `console-afrikapharma.vercel.app`
2. Se connecte avec compte `admin`
3. Voit le dashboard des ventes de TOUS les utilisateurs
4. Peut modifier une vente, ajouter des notes, etc.
5. L'utilisateur voit la modification en temps réel dans `afrikapharma.vercel.app`

### Scénario 2: Vendeur effectue une vente
1. Accède à `afrikapharma.vercel.app`
2. Se connecte avec compte `seller`
3. Crée une nouvelle vente
4. Elle apparaît immédiatement dans la console admin
5. Le superviseur peut la valider/modifier

### Scénario 3: Pharmacien gère l'inventaire
1. Accède à `afrikapharma.vercel.app`
2. Se connecte avec compte `pharmacist`
3. Met à jour le stock des médicaments
4. Le superviseur voit les changements en temps réel

---

## ✅ Prochaines étapes

1. Créer les dossiers de structure pour chaque app
2. Configurer les variables d'environnement séparées
3. Créer les middlewares RBAC distincts
4. Mettre à jour les fichiers de déploiement Vercel
5. Configurer les webhooks de déploiement
6. Tester l'intégration Console ↔ App
