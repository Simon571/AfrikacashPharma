# ⚡ Quick Reference - Système de Taux USD→CDF

## 🚀 Démarrage Rapide

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Ouvrir l'admin
http://localhost:3000/admin/exchange-rate

# 3. Se connecter (admin)
# Username: admin
# Password: Admin123!

# 4. Mettre à jour le taux
# → Modifier la valeur dans le formulaire
# → Cliquer "Mettre à Jour"
```

---

## 📍 URLs Principales

| URL | Accès | Description |
|-----|-------|-------------|
| `/admin/exchange-rate` | Admin | Gestionnaire du taux |
| `/admin/medications-prices` | Admin | Affichage des prix |
| `/api/exchange-rate` | Public (GET), Admin (PUT) | API endpoint |

---

## 🔐 Identifiants Par Défaut

| Rôle | Username | Password | Accès |
|------|----------|----------|-------|
| Admin | `admin` | `Admin123!` | ✅ Tout |
| Vendeur | `vendeur` | `vendeur123` | ❌ Pages admin |
| SuperAdmin | `superadmin` | `SuperAdmin123!` | ✅ Tout |

---

## 📡 API Endpoints

### GET /api/exchange-rate
Récupère le taux actuel (publique)

```bash
curl http://localhost:3000/api/exchange-rate
```

**Réponse**:
```json
{
  "id": "...",
  "rate": 2800,
  "currency": "USD",
  "createdAt": "2025-11-02T...",
  "updatedAt": "2025-11-02T..."
}
```

### PUT /api/exchange-rate
Met à jour le taux (admin uniquement)

```bash
curl -X PUT http://localhost:3000/api/exchange-rate \
  -H "Content-Type: application/json" \
  -d '{"rate": 2900}'
```

**Réponse (succès)**:
```json
{
  "id": "...",
  "rate": 2900,
  "currency": "USD",
  "medicationsUpdated": 42,
  "createdAt": "2025-11-02T...",
  "updatedAt": "2025-11-02T..."
}
```

**Réponse (erreur 403)**:
```json
{
  "message": "Non autorisé."
}
```

---

## 🛠️ Fichiers Clés

### 1. Actions Serveur
**Fichier**: `lib/actions/exchange-rate.ts`

```typescript
// Récupérer le taux
const rate = await getExchangeRate();

// Mettre à jour le taux
const result = await updateExchangeRate(2900, userId);
console.log(result.medicationsUpdated); // Nombre de médicaments affectés
```

### 2. Composant Manager
**Fichier**: `components/ExchangeRateManager.tsx`

```tsx
import { ExchangeRateManager } from '@/components/ExchangeRateManager';

export default function Page() {
  return <ExchangeRateManager />;
}
```

### 3. Composant Display
**Fichier**: `components/MedicationPriceDisplay.tsx`

```tsx
import { MedicationPriceDisplay } from '@/components/MedicationPriceDisplay';

export default function Page() {
  return (
    <MedicationPriceDisplay
      medicationId="med-1"
      name="Aspirin"
      priceUsd={100}
      priceCdf={280000}
    />
  );
}
```

---

## 🔍 Vérifications Rapides

### Check 1: API Accessible
```bash
curl -i http://localhost:3000/api/exchange-rate | grep "200 OK"
# ✅ Si vous voyez "200 OK"
```

### Check 2: Auth Fonctionne
```bash
curl -i -X PUT http://localhost:3000/api/exchange-rate \
  -d '{"rate": 2900}' | grep "403 Forbidden"
# ✅ Si vous voyez "403 Forbidden" (expected sans auth)
```

### Check 3: Base de Données Accessible
```bash
npx prisma db execute "SELECT * FROM \"ExchangeRate\" LIMIT 1;"
# ✅ Si vous voyez au moins une ligne
```

### Check 4: Pas d'Erreurs TypeScript
```bash
npm run type-check
# ✅ Si vous voyez "No errors!"
```

---

## 📊 Schéma Base de Données

### Table ExchangeRate
```sql
CREATE TABLE "ExchangeRate" (
  id        String  PRIMARY KEY
  rate      Float   -- Ex: 2800
  currency  String  UNIQUE -- Ex: "USD"
  createdAt DateTime
  updatedAt DateTime
)
```

### Colonnes Medication Modifiées
```
priceUsd          Float?  -- Prix en USD (optionnel)
purchasePriceUsd  Float?  -- Prix achat USD (optionnel)
price             Float   -- Prix en CDF (existant)
purchasePrice     Float   -- Prix achat CDF (existant)
```

---

## 🎯 Flux de Travail Typique

### Scenario 1: Admin Met à Jour le Taux
```
1. Admin se connecte → admin/Admin123!
2. Accès /admin/exchange-rate
3. Remplit le nouveau taux (ex: 2900)
4. Clique "Mettre à Jour"
5. API PUT /api/exchange-rate
6. Vérification auth (admin role)
7. Transaction BD:
   - Met à jour ExchangeRate
   - Recalcule 100 médicaments
   - Crée AuditLog
8. Admin voit: "Taux mis à jour! 42 médicaments recalculés"
```

### Scenario 2: Vendeur Consulte les Prix
```
1. Vendeur se connecte → vendeur/vendeur123
2. Accès /admin/medications-prices
3. Redirection /login (pas admin)
4. ❌ Accès refusé
```

### Scenario 3: Récupérer le Taux Programmatiquement
```
1. Frontend appelle fetch('/api/exchange-rate')
2. API retourne le taux actuel (2800)
3. Frontend utilise taux pour afficher prix USD→CDF
4. Exemple: 100 USD × 2800 = 280,000 CDF
```

---

## 🐛 Erreurs Courantes & Solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `404 Not Found` sur `/admin/exchange-rate` | Pas authentifié | Se connecter en admin |
| `403 Forbidden` sur PUT API | Pas admin | Utiliser un compte admin |
| `400 Bad Request` sur PUT API | Taux invalide | Taux doit être > 0 |
| `[auth] Utilisateur introuvable` | Utilisateur pas créé | `node scripts/create-default-users.js` |
| `Column does not exist` Prisma | Schéma pas sync | `npx prisma generate` |
| Styles CSS manquants | Tailwind pas compilé | Redémarrer `npm run dev` |

---

## 📝 Configuration

### .env.local (Requis)
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### next.config.js
```javascript
// Aucune configuration spéciale requise
// Les paths alias @/ sont déjà configurés
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## ✅ Validation Finale

Avant de déployer, vérifiez:

- [ ] Fichier `lib/actions/exchange-rate.ts` ✅
- [ ] Fichier `lib/nextauth-config.ts` ✅
- [ ] Fichier `components/ExchangeRateManager.tsx` ✅
- [ ] Fichier `components/MedicationPriceDisplay.tsx` ✅
- [ ] Fichier `pages/admin/exchange-rate.tsx` ✅
- [ ] Fichier `pages/admin/medications-prices.tsx` ✅
- [ ] Fichier `pages/api/exchange-rate.ts` ✅
- [ ] `npm run type-check` ✅ Aucune erreur
- [ ] `npm run dev` ✅ Serveur démarre sur 3000
- [ ] API GET retourne 200 ✅
- [ ] API PUT retourne 403 sans auth ✅
- [ ] Admin page accessible ✅

---

## 💡 Tips & Tricks

### Déboguer une Requête API
```javascript
// Dans DevTools Console
fetch('/api/exchange-rate')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Voir les Logs des Erreurs
```bash
# Terminal where npm run dev is running
# Cherchez les lignes rouges avec "error"
```

### Tester avec cURL (Windows)
```powershell
# Pour GET
$response = Invoke-WebRequest http://localhost:3000/api/exchange-rate
$response.Content | ConvertFrom-Json

# Pour PUT
$body = @{rate = 2900} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3000/api/exchange-rate `
  -Method PUT -Body $body -ContentType application/json
```

### Réinitialiser la Base
```bash
# ⚠️ Attention: Supprime toutes les données!
npx prisma migrate reset
npm run dev
```

---

## 🎓 Ressources

- [Documentation Prisma](https://www.prisma.io/docs/)
- [Documentation NextAuth](https://next-auth.js.org/)
- [Documentation Next.js Pages Router](https://nextjs.org/docs/pages)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Last Updated**: 2025-11-02
**Status**: ✅ Production Ready
