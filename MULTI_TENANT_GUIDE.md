# 🚀 Guide Complet : Système Multi-Instance et Multi-Abonnement pour AfrikaPharma

## 📋 Table des matières

1. [Architecture](#architecture)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Utilisation](#utilisation)
5. [API Endpoints](#api-endpoints)
6. [Déploiement](#déploiement)
7. [Monitoring](#monitoring)

---

## 🏗️ Architecture

### Structure générale

```
┌─────────────────────────────────────────────────────────┐
│            Console SuperAdmin (Next.js)                 │
│  - Tableau de bord central                              │
│  - Gestion des instances                                │
│  - Facturation et paiements                             │
│  - Monitoring des abonnements                           │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│   Vercel API     │    │   Base de données    │
│  - Déploiement   │    │     PostgreSQL       │
│  - Domaines      │    │  - Instances         │
│  - Env vars      │    │  - Abonnements       │
└──────────────────┘    │  - Paiements         │
                        │  - Audit logs        │
        ┌──────────────►│  - Notifications     │
        │               └──────────────────────┘
        │
        ├────────────┬────────────┬────────────┐
        │            │            │            │
        ▼            ▼            ▼            ▼
    Instance 1   Instance 2   Instance 3   Instance N
    (Pharmacy A) (Pharmacy B) (Grossiste) (Distributeur)
    - DB privée  - DB privée  - DB privée  - DB privée
    - Vercel URL - Vercel URL - Vercel URL - Vercel URL
```

### Modèles de données principaux

#### Instance
- `id`: Identifiant unique
- `name`: Nom de l'instance (ex: "Pharmacie Marie")
- `subdomain`: Sous-domaine Vercel (ex: "pharma-marie.vercel.app")
- `customDomain`: Domaine personnalisé optionnel
- `subscription`: Lien vers l'abonnement actif
- `settings`: Configuration personnalisée
- `status`: pending, active, suspended, deleted

#### Subscription
- `planType`: trial, monthly, quarterly, annual, lifetime
- `startDate` / `endDate`: Période d'abonnement
- `status`: active, expired, suspended, cancelled
- `autoRenew`: Renouvellement automatique
- `failedPaymentAttempts`: Compteur d'échecs

#### Payment
- `status`: pending, received, failed, refunded
- `paymentMethod`: avadapay, strowallet, stripe, manual
- `transactionReference`: ID du fournisseur

---

## 💾 Installation

### 1. Prérequis

```bash
# Node.js 18+
node --version

# npm ou yarn
npm --version
```

### 2. Dépendances à ajouter

```bash
npm install stripe twilio nodemailer
# ou
npm install @stripe/stripe-js
npm install twilio
npm install nodemailer
```

### 3. Schéma Prisma

Le schéma a été étendu. Pour migrer :

```bash
npx prisma migrate dev --name add_multi_tenant_schema
npx prisma generate
```

---

## ⚙️ Configuration

### 1. Variables d'environnement (.env.local)

```env
# === Base de données ===
DATABASE_URL="postgresql://user:password@host:5432/afrikacash"

# === Vercel API ===
VERCEL_API_TOKEN="your_vercel_api_token"
VERCEL_TEAM_ID="your_vercel_team_id"
GITHUB_REPO="simon571/AfrikacashPharma"

# === Paiements ===
# AvadaPay
AVADAPAY_API_KEY="your_avadapay_key"

# Strowallet
STROWALLET_API_KEY="your_strowallet_key"
STROWALLET_API_SECRET="your_strowallet_secret"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# === Notifications ===
# SMTP (Email)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASSWORD="your_app_password"
SMTP_FROM_EMAIL="noreply@afrikacashpharma.com"

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_PHONE_NUMBER="+1234567890"

# === Sécurité ===
CRON_SECRET="your_cron_secret_key"
APP_URL="https://admin-console.vercel.app"

# === Optional ===
NEXT_PUBLIC_APP_ENV="production"
```

### 2. Configuration Prisma (prisma/schema.prisma)

✅ Déjà configuré avec les modèles :
- `Instance`
- `InstanceSettings`
- `Subscription`
- `Payment`
- `DeploymentLog`
- `InstanceAuditLog`
- `Invoice`
- `Notification`

---

## 🎯 Utilisation

### 1. Créer une nouvelle instance

**Via l'API:**

```bash
curl -X POST http://localhost:3001/api/admin/instances \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pharmacie Marie",
    "subdomain": "pharma-marie",
    "ownerName": "Marie Dupont",
    "ownerEmail": "marie@example.com",
    "ownerPhone": "+33612345678",
    "primaryColor": "#FF6B6B",
    "secondaryColor": "#4ECDC4",
    "planType": "trial"
  }'
```

**Response:**

```json
{
  "id": "inst_abc123",
  "name": "Pharmacie Marie",
  "subdomain": "pharma-marie",
  "status": "pending",
  "vercelProjectId": "prj_123",
  "vercelDeploymentUrl": "https://pharma-marie.vercel.app",
  "subscriptionId": "sub_xyz789",
  "createdAt": "2024-10-30T14:30:00Z"
}
```

### 2. Récupérer toutes les instances

```bash
curl http://localhost:3001/api/admin/instances \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Mettre à jour une instance

```bash
curl -X PATCH http://localhost:3001/api/admin/instances/inst_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pharmacie Marie - Rénovée",
    "primaryColor": "#3B82F6"
  }'
```

### 4. Suspendre une instance

```bash
curl -X POST http://localhost:3001/api/admin/instances/inst_abc123/suspend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Non-paiement"
  }'
```

### 5. Réactiver une instance

```bash
curl -X POST http://localhost:3001/api/admin/instances/inst_abc123/reactivate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Supprimer une instance

```bash
curl -X DELETE http://localhost:3001/api/admin/instances/inst_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📡 API Endpoints

### Instances

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/admin/instances` | Créer une instance |
| `GET` | `/api/admin/instances` | Lister les instances |
| `GET` | `/api/admin/instances/[id]` | Récupérer une instance |
| `PATCH` | `/api/admin/instances/[id]` | Mettre à jour |
| `DELETE` | `/api/admin/instances/[id]` | Supprimer |
| `POST` | `/api/admin/instances/[id]/suspend` | Suspendre |
| `POST` | `/api/admin/instances/[id]/reactivate` | Réactiver |

### Abonnements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/admin/subscriptions?status=expiring` | Abonnements expirant |
| `GET` | `/api/admin/subscriptions?status=expired` | Abonnements expirés |
| `POST` | `/api/admin/subscriptions/[id]/renew` | Renouveler |

### Paiements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/payments/initiate` | Initier un paiement |
| `POST` | `/api/payments/[id]/confirm` | Confirmer un paiement |

### CRON Jobs

| Méthode | Endpoint | Fréquence |
|---------|----------|-----------|
| `POST` | `/api/cron/manage-subscriptions` | Quotidienne (minuit UTC) |

---

## 🚀 Déploiement

### Sur Vercel (Console SuperAdmin)

1. **Connecter le repo GitHub:**

```bash
vercel link
```

2. **Configurer les variables d'environnement dans Vercel Dashboard:**

```
VERCEL_API_TOKEN
VERCEL_TEAM_ID
DATABASE_URL
AVADAPAY_API_KEY
STROWALLET_API_KEY
STROWALLET_API_SECRET
STRIPE_SECRET_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
CRON_SECRET
```

3. **Déployer:**

```bash
vercel deploy
```

### Configuration du CRON Job

**Option 1: Vercel Cron (recommandé)**

Dans `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/manage-subscriptions",
    "schedule": "0 0 * * *"
  }]
}
```

**Option 2: EasyCron ou AWS Lambda**

```bash
curl -X POST "https://www.easycron.com/set/?token=YOUR_TOKEN&url=https://your-app.vercel.app/api/cron/manage-subscriptions"
```

---

## 📊 Monitoring

### 1. Logs Prisma

```typescript
// Activer les logs
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### 2. Dashboard Vercel

- Accéder à: https://vercel.com/dashboard
- Vérifier les déploiements et domaines de chaque instance

### 3. Monitoring des Abonnements

```sql
-- PostgreSQL: Instances expirées non gérées
SELECT i.id, i.name, s.endDate
FROM instances i
JOIN subscriptions s ON i."subscriptionId" = s.id
WHERE s.status = 'active' AND s."endDate" < NOW();

-- Paiements échoués récents
SELECT * FROM payments
WHERE status = 'failed'
AND "createdAt" > NOW() - INTERVAL '7 days'
ORDER BY "createdAt" DESC;
```

### 4. Métriques SaaS importantes

```typescript
// Calculer le MRR (Monthly Recurring Revenue)
const mrr = subscriptions
  .filter(s => ['monthly', 'quarterly', 'annual'].includes(s.planType))
  .reduce((sum, s) => sum + s.amount, 0);

// Taux de churn
const churnRate = (cancelledThisMonth / activeLastMonth) * 100;

// Lifetime Value (LTV)
const ltv = (averageRevenue / monthlyChurnRate);

// Customer Acquisition Cost (CAC)
const cac = totalMarketingCosts / newCustomers;
```

---

## 🔒 Sécurité

### 1. Authentication

- Utiliser JWT ou NextAuth.js pour protéger les endpoints
- Implémenter une vérification de role (super-admin)

```typescript
// Exemple avec NextAuth.js
export async function verifySuperAdmin(session: Session): Promise<boolean> {
  return session?.user?.role === 'super-admin';
}
```

### 2. Validation des entrées

```typescript
// Valider les domaines personnalisés
function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain);
}
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api/', limiter);
```

---

## 📚 Ressources

- [Types TypeScript complètes](/types/multi-tenant.ts)
- [Services métier](/lib/services/)
- [Endpoints API](/app/api/admin/)
- [Dashboard UI](/app/admin/dashboard/)

---

## 🐛 Troubleshooting

### Erreur: "VERCEL_API_TOKEN not set"

```bash
# Générer un token: https://vercel.com/account/tokens
export VERCEL_API_TOKEN="your_token"
```

### Erreur: "Payment method not supported"

Vérifier que `AVADAPAY_API_KEY` ou `STRIPE_SECRET_KEY` sont configurés.

### Les notifications ne s'envoient pas

1. Vérifier `SMTP_HOST` et `SMTP_PASSWORD`
2. Activer "Applications moins sécurisées" sur Gmail
3. Vérifier les logs: `npx prisma studio`

---

## 📝 Notes importantes

✅ Le système est **entièrement asynchrone** - les longs traitements se font via CRON
✅ Chaque instance a sa **propre base de données** (isolation complète)
✅ Les notifications s'envoient via **email et WhatsApp**
✅ Les paiements sont **sécurisés** et **PCI compliant**
✅ Les logs d'audit sont **conservés indéfiniment**

---

**Dernière mise à jour:** 30 octobre 2024
**Auteur:** AI Copilot
**Version:** 1.0.0
