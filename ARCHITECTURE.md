# 🏗️ Structure du Projet Multi-Instance

## 📁 Arborescence

```
admin-console/
├── app/
│   ├── api/
│   │   ├── admin/                    # ✅ NEW - Console SuperAdmin
│   │   │   ├── instances/
│   │   │   │   ├── route.ts         # GET/POST instances
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts     # GET/PATCH/DELETE instance
│   │   │   │       └── [action]/
│   │   │   │           └── route.ts # suspend/reactivate
│   │   │   └── subscriptions/
│   │   │       └── route.ts         # GET subscriptions
│   │   │
│   │   ├── cron/                    # ✅ NEW - Tâches en arrière-plan
│   │   │   └── manage-subscriptions/
│   │   │       └── route.ts         # CRON job quotidien
│   │   │
│   │   ├── payments/                # Endpoints de paiement
│   │   └── ...
│   │
│   ├── admin/                       # ✅ NEW - UI Console
│   │   └── dashboard/
│   │       └── page.tsx             # Tableau de bord principal
│   │
│   └── ...
│
├── lib/
│   ├── services/                    # ✅ NEW - Logique métier
│   │   ├── instance.service.ts      # Gestion des instances
│   │   ├── subscription.service.ts  # Gestion des abonnements
│   │   ├── payment.service.ts       # Gestion des paiements
│   │   ├── notification.service.ts  # Gestion des notifications
│   │   └── vercel.service.ts        # Intégration Vercel API
│   │
│   ├── config.ts
│   ├── prisma.ts
│   └── ...
│
├── types/
│   └── multi-tenant.ts              # ✅ NEW - Types TypeScript
│
├── prisma/
│   └── schema.prisma                # ✅ UPDATED - Modèles étendus
│
├── scripts/
│   └── setup-multi-tenant.ts        # ✅ NEW - Setup script
│
├── MULTI_TENANT_GUIDE.md            # ✅ NEW - Documentation complète
├── ARCHITECTURE.md                  # ✅ NEW - Architecture détaillée
├── package.json                     # À mettre à jour
└── ...
```

## 🚀 Fichiers créés/modifiés

### Modèles de données
- **prisma/schema.prisma**: +6 nouveaux modèles (Instance, Subscription, Payment, etc.)

### Types TypeScript
- **types/multi-tenant.ts**: Types et énumérations complets

### Services
- **lib/services/instance.service.ts**: Création, mise à jour, gestion des instances
- **lib/services/subscription.service.ts**: Cycle de vie des abonnements
- **lib/services/payment.service.ts**: Intégration des fournisseurs de paiement
- **lib/services/notification.service.ts**: Email et WhatsApp
- **lib/services/vercel.service.ts**: Déploiement automatique

### API Endpoints
- **app/api/admin/instances/route.ts**: CRUD instances
- **app/api/admin/instances/[id]/route.ts**: Gestion instance spécifique
- **app/api/admin/instances/[id]/[action]/route.ts**: Suspend/Reactivate
- **app/api/admin/subscriptions/route.ts**: Gestion abonnements
- **app/api/cron/manage-subscriptions/route.ts**: CRON job quotidien

### UI
- **app/admin/dashboard/page.tsx**: Console SuperAdmin avec tableau de bord

### Documentation
- **MULTI_TENANT_GUIDE.md**: Guide complet d'utilisation
- **ARCHITECTURE_DIAGRAM.md**: Diagramme d'architecture

---

## 📦 Dépendances à ajouter

```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "twilio": "^4.0.0",
    "nodemailer": "^6.9.0",
    "@types/nodemailer": "^6.4.0"
  }
}
```

**Installation:**

```bash
npm install stripe twilio nodemailer @types/nodemailer
```

---

## 🔄 Flux de travail

### 1. Créer une nouvelle instance

```
SuperAdmin  →  POST /api/admin/instances
              ↓
         InstanceService
         ├─ Valider les données
         ├─ Créer l'abonnement (SubscriptionService)
         ├─ Déployer sur Vercel (VercelService)
         ├─ Créer l'enregistrement BDD (Prisma)
         └─ Envoyer un email de confirmation
              ↓
         Instance crée et en attente de déploiement
```

### 2. Renouveler un abonnement (CRON)

```
CRON Job (quotidien 00:00 UTC)
         ├─ Récupérer les abonnements expirés
         ├─ Récupérer les abonnements expirant bientôt
         ├─ Marquer comme expiré (Subscription)
         ├─ Suspendre l'instance (Instance)
         ├─ Envoyer un rappel 2j avant (Notification)
         └─ Logger toutes les actions (AuditLog)
```

### 3. Traiter un paiement

```
Client  →  POST /api/payments/initiate
           ↓
      PaymentService
      ├─ Valider les paramètres
      ├─ Sélectionner le gateway (AvadaPay, Strowallet, Stripe)
      ├─ Initier le paiement
      ├─ Créer un enregistrement Payment (status: pending)
      └─ Rediriger vers le gateway
           ↓
      Gateway fournisseur
      └─ Callback → POST /api/payments/[id]/confirm
           ↓
      PaymentService
      ├─ Valider la signature
      ├─ Confirmer le paiement (status: received)
      ├─ Renouveler l'abonnement
      └─ Envoyer une facture (Invoice)
```

---

## ⚡ Configuration rapide

### 1. Variables d'environnement

Copier `.env.example` vers `.env.local` et remplir:

```bash
cp .env.example .env.local
```

### 2. Migration de base de données

```bash
npx prisma migrate dev --name add_multi_tenant
npx prisma generate
```

### 3. Initialiser les données

```bash
npx ts-node scripts/setup-multi-tenant.ts
```

### 4. Démarrer le serveur

```bash
npm run dev
```

### 5. Accéder à la console

- **Dashboard:** http://localhost:3001/admin/dashboard
- **API Docs:** http://localhost:3001/api/admin/instances

---

## 🔐 Authentification

Les endpoints `/api/admin/*` vérifient le JWT et le role `super-admin`.

Exemple de token JWT:

```typescript
const token = jwt.sign(
  { userId: 'user123', role: 'super-admin' },
  process.env.JWT_SECRET!,
  { expiresIn: '24h' }
);
```

À utiliser dans les headers:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Statistiques importantes

| Métrique | Formule | Importance |
|----------|---------|-----------|
| **MRR** | Σ(abonnements actifs × montant) | 🔴 Critique |
| **Churn Rate** | (Cancelled / Total last month) × 100 | 🔴 Critique |
| **LTV** | Average Revenue / Monthly Churn Rate | 🟡 Important |
| **CAC** | Total Marketing Costs / New Customers | 🟡 Important |
| **ARPU** | Total Revenue / Active Users | 🟢 Info |

---

## 🧪 Tests

### Test manuel de création d'instance

```bash
curl -X POST http://localhost:3001/api/admin/instances \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pharmacie Test",
    "subdomain": "pharma-test-001",
    "ownerName": "Test User",
    "ownerEmail": "test@example.com",
    "planType": "trial"
  }'
```

### Vérifier les instances

```bash
curl http://localhost:3001/api/admin/instances \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📞 Support

Pour les questions ou bugs:

1. Vérifier la documentation: `MULTI_TENANT_GUIDE.md`
2. Consulter les types: `types/multi-tenant.ts`
3. Analyser les services: `lib/services/`
4. Checker les logs: `npx prisma studio`

---

**Version:** 1.0.0  
**Dernière maj:** 30 octobre 2024  
**Maintenir par:** Team DevOps
