# 🚀 Console SuperAdmin Multi-Instance pour AfrikaPharma

**Système complet de gestion multi-tenant avec abonnements automatisés, paiements, et déploiement Vercel.**

---

## ✨ Fonctionnalités principales

### 🧩 Gestion Multi-Instance
- ✅ Créer, modifier, supprimer des instances (pharmacies, grossistes, etc.)
- ✅ Déploiement automatique sur Vercel via l'API
- ✅ Domaines personnalisés + CNAME automatique
- ✅ Configuration de branding (logo, couleurs, thème)
- ✅ Clés API uniques par instance

### 💳 Système d'Abonnement Complet
- ✅ **Essai gratuit** (7/14/30 jours) - mode lecture seule après
- ✅ **Abonnements temporaires** (mensuel, trimestriel, annuel)
- ✅ **Licence à vie** - paiement unique permanent
- ✅ Renouvellement automatique avec auto-renew
- ✅ Gestion des paiements échoués (3 tentatives)

### 💰 Paiements Multi-Fournisseur
- ✅ **AvadaPay** - Mobile Money (Orange Money, MTN, etc.)
- ✅ **Strowallet** - Cartes bancaires
- ✅ **Stripe** - Paiements internationaux
- ✅ Gestion des remboursements
- ✅ Webhooks de confirmation

### 📬 Notifications Automatiques
- ✅ **Email** - Rappels d'expiration, paiement échoué
- ✅ **WhatsApp** - Messages personnalisés via Twilio
- ✅ Envoi 2 jours avant expiration
- ✅ Branding personnalisé dans les emails

### 📊 Tableau de Bord Complet
- ✅ Statistiques en temps réel
- ✅ Liste des instances avec filtres
- ✅ MRR (Monthly Recurring Revenue)
- ✅ Taux de churn et métriques SaaS
- ✅ Historique des actions (audit logs)

### ⚙️ Tâches Automatisées
- ✅ CRON job quotidien pour gérer les abonnements
- ✅ Expiration automatique
- ✅ Suspension automatique après paiement échoué
- ✅ Emails de rappel programmés

---

## 📁 Structure du projet

```
console/
├── lib/services/
│   ├── instance.service.ts       (Gestion instances)
│   ├── subscription.service.ts   (Cycle de vie abonnements)
│   ├── payment.service.ts        (Intégration paiements)
│   ├── notification.service.ts   (Email + WhatsApp)
│   └── vercel.service.ts         (Déploiement Vercel)
├── types/
│   └── multi-tenant.ts           (Types & énums)
├── app/api/admin/
│   ├── instances/                (CRUD instances)
│   ├── subscriptions/            (Gestion abonnements)
│   └── cron/                     (Jobs automatisés)
├── app/admin/dashboard/
│   └── page.tsx                  (UI Console)
├── prisma/schema.prisma          (6 nouveaux modèles)
├── scripts/
│   └── setup-multi-tenant.ts     (Initialisation)
└── docs/
    ├── MULTI_TENANT_GUIDE.md     (Guide complet)
    └── ARCHITECTURE.md           (Architecture détaillée)
```

---

## 🚀 Démarrage rapide

### 1. Installation

```bash
# Cloner le repo
git clone https://github.com/simon571/AfrikacashPharma.git
cd admin-console

# Installer les dépendances
npm install

# Ajouter les nouvelles dépendances
npm install stripe twilio nodemailer @types/nodemailer
```

### 2. Configuration

```bash
# Copier et remplir le fichier d'environnement
cp .env.example .env.local

# Puis éditer .env.local avec vos clés:
# - VERCEL_API_TOKEN
# - DATABASE_URL
# - STRIPE_SECRET_KEY
# - TWILIO_ACCOUNT_SID
# - SMTP_HOST, SMTP_USER, SMTP_PASSWORD
# - etc...
```

### 3. Base de données

```bash
# Créer les nouvelles tables
npx prisma migrate dev --name add_multi_tenant

# Générer le client Prisma
npx prisma generate

# Initialiser les données (optionnel)
npm run setup:multi-tenant
```

### 4. Démarrer

```bash
# Développement
npm run dev
# → http://localhost:3001/admin/dashboard

# Production
npm run build
npm start
```

---

## 📡 API Endpoints

### Instances

```bash
# Créer une instance
POST   /api/admin/instances
       Body: { name, subdomain, ownerEmail, planType }

# Lister les instances
GET    /api/admin/instances?status=active&limit=10

# Récupérer une instance
GET    /api/admin/instances/inst_123

# Mettre à jour
PATCH  /api/admin/instances/inst_123
       Body: { name, logo, primaryColor }

# Suspendre
POST   /api/admin/instances/inst_123/suspend
       Body: { reason: "Non-paiement" }

# Réactiver
POST   /api/admin/instances/inst_123/reactivate

# Supprimer
DELETE /api/admin/instances/inst_123
```

### Abonnements

```bash
# Abonnements expirant bientôt
GET    /api/admin/subscriptions?status=expiring

# Abonnements expirés
GET    /api/admin/subscriptions?status=expired
```

### CRON Jobs

```bash
# Exécuter le job de gestion des abonnements
POST   /api/cron/manage-subscriptions
       Header: Authorization: Bearer CRON_SECRET
```

---

## 🎯 Plans d'abonnement

| Plan | Prix | Durée | Utilisateurs | Produits | Paiements |
|------|------|-------|--------------|----------|-----------|
| **Trial** | 0€ | 7j | 5 | 100 | ❌ |
| **Monthly** | 49.99€ | 1m | 25 | 5000 | ✅ |
| **Quarterly** | 129.99€ | 3m | 50 | 10000 | ✅ |
| **Annual** | 449.99€ | 12m | 100 | 50000 | ✅ |
| **Lifetime** | 999.99€ | ∞ | 500 | ∞ | ✅ |

---

## 🔐 Authentification

Les endpoints `/api/admin/*` nécessitent:

1. **Authorization Header:**
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

2. **Token JWT valide** avec:
   ```json
   {
     "userId": "user123",
     "role": "super-admin",
     "iat": 1635000000,
     "exp": 1635086400
   }
   ```

3. **Secret JWT** configuré dans `.env.local`:
   ```
   JWT_SECRET="your_secret_here"
   ```

---

## 📊 Métriques & Monitoring

### Tableau de Bord

Le tableau de bord affiche:
- Instances totales / actives / en trial / suspendues
- Utilisateurs actifs
- Revenus totaux & MRR
- Churn rate
- Dernière activité

### SQL pour Analytics

```sql
-- Total MRR
SELECT SUM(amount) FROM subscriptions 
WHERE status = 'active' 
AND "planType" IN ('monthly', 'quarterly', 'annual');

-- Instances par statut
SELECT status, COUNT(*) FROM instances GROUP BY status;

-- Paiements échoués ce mois
SELECT COUNT(*) FROM payments
WHERE status = 'failed'
AND "createdAt" > NOW() - INTERVAL '30 days';
```

---

## 🔄 Flux de travail typique

### 1️⃣ Créer une instance

```bash
# Superadmin crée une instance via le dashboard
POST /api/admin/instances {
  name: "Pharmacie Marie",
  subdomain: "pharma-marie",
  ownerName: "Marie",
  ownerEmail: "marie@example.com",
  planType: "trial"  # 7 jours d'essai
}

# Actions automatiques:
# ✓ Crée l'abonnement (7 jours)
# ✓ Déploie sur Vercel (pharma-marie.vercel.app)
# ✓ Configure les variables d'environnement
# ✓ Crée les logs d'audit
# ✓ Envoie un email de bienvenue
```

### 2️⃣ Essai expire

```
CRON Job (quotidien 00:00 UTC)
  ├─ Détecte: essai de Pharmacie Marie expire demain
  ├─ Envoie: email de rappel + message WhatsApp
  ├─ 2j plus tard: marque comme expiré
  ├─ Suspend: l'instance (mode lecture seule)
  └─ Logs: tout est tracé dans l'audit
```

### 3️⃣ Propriétaire paye

```bash
# Propriétaire clique "Renouveler mon abonnement"
POST /api/payments/initiate {
  instanceId: "inst_123",
  amount: 49.99,
  paymentMethod: "avadapay"  # ou stripe
}

# Actions automatiques:
# ✓ Redirige vers AvadaPay / Stripe
# ✓ Reçoit le callback du fournisseur
# ✓ Renouvelle l'abonnement (1 mois)
# ✓ Réactive l'instance
# ✓ Envoie la facture
# ✓ Met à jour le MRR
```

---

## 🧪 Tests

### Tester la création d'instance

```bash
curl -X POST http://localhost:3001/api/admin/instances \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pharmacy",
    "subdomain": "test-pharmacy-001",
    "ownerName": "Test User",
    "ownerEmail": "test@example.com",
    "planType": "trial"
  }'
```

### Tester les notifications

```bash
npm run test:notifications
# Envoie un email et un message WhatsApp de test
```

### Tester les paiements

```bash
npm run test:payments
# Teste chaque gateway (AvadaPay, Strowallet, Stripe)
```

---

## 📚 Documentation complète

- **[MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md)** - Guide d'utilisation détaillé
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique
- **[types/multi-tenant.ts](./types/multi-tenant.ts)** - Types TypeScript complètes

---

## 🐛 Troubleshooting

### "VERCEL_API_TOKEN not set"
```bash
# Générer un token: https://vercel.com/account/tokens
export VERCEL_API_TOKEN="your_token"
```

### "Email not sending"
1. Vérifier `SMTP_HOST` et `SMTP_PASSWORD`
2. Pour Gmail: activer [App Passwords](https://myaccount.google.com/apppasswords)
3. Checker les logs: `npx prisma studio`

### "Payment gateway error"
1. Vérifier les credentials (STRIPE_SECRET_KEY, AVADAPAY_API_KEY)
2. Tester en mode sandbox si disponible
3. Checker les webhooks configurations

---

## 📞 Support

Pour les questions:
1. Consulter les guides (MULTI_TENANT_GUIDE.md)
2. Vérifier les types (types/multi-tenant.ts)
3. Analyser les services (lib/services/)
4. Consulter Prisma Studio: `npx prisma studio`

---

## 📜 Licence

MIT - Libre d'utilisation et de modification

---

## 🙏 Remerciements

- Vercel pour l'API de déploiement
- Prisma pour l'ORM
- Next.js 15 pour le framework
- Tous les contributeurs

---

**Version:** 1.0.0  
**Date:** 30 octobre 2024  
**Status:** ✅ Production Ready

**Prochaines étapes:**
- [ ] Intégrer NextAuth.js pour l'authentification
- [ ] Ajouter les graphiques détaillés au dashboard
- [ ] Implémenter le système d'affiliation
- [ ] Ajouter le support multi-langue
- [ ] Configurer le monitoring (Sentry, DataDog)

---

Vousêtes prêt à transformer AfrikaPharma en plateforme SaaS! 🚀
