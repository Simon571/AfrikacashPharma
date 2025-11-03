# 🧪 Guide de Test - Système de Taux de Change

## 📋 Checklist de Vérification

### ✅ Fichiers Créés
- [x] `lib/actions/exchange-rate.ts` - Logique métier
- [x] `lib/nextauth-config.ts` - Configuration NextAuth
- [x] `components/ExchangeRateManager.tsx` - UI gestionnaire
- [x] `components/MedicationPriceDisplay.tsx` - Affichage prix
- [x] `pages/admin/exchange-rate.tsx` - Page admin taux
- [x] `pages/admin/medications-prices.tsx` - Page admin prix
- [x] `pages/api/exchange-rate.ts` - API endpoint

### ✅ Serveur Démarré
```bash
npm run dev
# Le serveur devrait écouter sur http://localhost:3000
```

---

## 🔍 Tests à Effectuer

### Test 1: API GET (Public)
**Endpoint**: `GET /api/exchange-rate`
**Authentification**: Non requise

```bash
# Commande
curl http://localhost:3000/api/exchange-rate

# Résultat attendu
{
  "id": "cmhia2bby0000we8k6elwtj4h",
  "rate": 2800,
  "currency": "USD",
  "createdAt": "2025-11-02T22:23:25.150Z",
  "updatedAt": "2025-11-02T22:23:25.150Z"
}

# Status Code: 200 OK
```

### Test 2: API PUT Sans Authentification (Doit échouer)
**Endpoint**: `PUT /api/exchange-rate`
**Authentification**: Requise

```bash
# Commande
curl -X PUT http://localhost:3000/api/exchange-rate \
  -H "Content-Type: application/json" \
  -d '{"rate": 2900}'

# Résultat attendu
{
  "message": "Non autorisé."
}

# Status Code: 403 Forbidden
```

### Test 3: Accès à la Page Admin Sans Authentification (Doit rediriger)
**URL**: `http://localhost:3000/admin/exchange-rate`

```
Action: Accédez à cette URL dans le navigateur
Résultat attendu: Redirection vers /login
Status Code: 307 ou 302 (redirect)
```

### Test 4: Se Connecter en tant qu'Admin
**URL**: `http://localhost:3000/login`

```
Credentials:
- Username: admin
- Password: Admin123!

Résultat attendu: 
- Session créée
- Redirection vers la page d'avant
- Cookie NextAuth.Session défini
```

### Test 5: Accéder à la Page du Taux en tant qu'Admin
**URL**: `http://localhost:3000/admin/exchange-rate`

```
Action: Accédez avec l'authentification
Résultat attendu:
- Page charge sans erreur 404
- Interface du gestionnaire affichée
- Taux actuel visible (2800)
- Formulaire pour mettre à jour disponible
```

### Test 6: Vérifier les Données de la Page
**Dans le navigateur DevTools -> Network**

```
Requête vers /admin/exchange-rate:
- Status: 200 OK
- Page Server Side Rendered

Requête vers /api/exchange-rate (depuis le composant):
- Status: 200 OK
- Réponse JSON avec le taux
```

### Test 7: Mettre à Jour le Taux (Si Authentifié)
**Action**: Depuis la page admin

1. Changer la valeur du taux (ex: 2800 → 2900)
2. Cliquer "Mettre à Jour"
3. Observer la réponse

```
Résultat attendu:
- Message de succès: "Taux mis à jour! X médicaments recalculés"
- Le taux actuel mis à jour
- Affichage du changement (+100 CDF, +3.57%)
```

### Test 8: Voir les Prix des Médicaments
**URL**: `http://localhost:3000/admin/medications-prices`

```
Action: Accédez en tant qu'admin
Résultat attendu:
- Page charge
- Liste des médicaments affichée
- Chaque médicament a ses prix CDF
- Taux actuel affiché en header
```

---

## 📊 Vérifications TypeScript

```bash
# Compiler TypeScript (aucune erreur attendue)
npm run type-check

# Résultat attendu
# ✔ No errors!
```

---

## 🗄️ Vérifications Base de Données

### Vérifier la Table ExchangeRate
```sql
-- PostgreSQL
SELECT * FROM "ExchangeRate";

-- Résultat attendu (minimum)
id   | rate | currency | createdAt | updatedAt
-----|------|----------|-----------|----------
xxx  | 2800 | USD      | ...       | ...
```

### Vérifier la Table AuditLog
```sql
-- Après une mise à jour du taux
SELECT * FROM "AuditLog" 
WHERE action = 'exchange_rate_update' 
ORDER BY timestamp DESC 
LIMIT 1;

-- Résultat attendu
id   | action                 | model         | recordId | userId | oldValue | newValue
-----|------------------------|---------------|----------|--------|----------|----------
xxx  | exchange_rate_update   | ExchangeRate  | xxx      | xxx    | {...}    | {...}
```

---

## 🔐 Tests de Sécurité

### Test 1: Admin Peut Mettre à Jour
```bash
# Avec session authentifiée en admin
curl -X PUT http://localhost:3000/api/exchange-rate \
  -H "Content-Type: application/json" \
  -H "Cookie: nextauth.token=..." \
  -d '{"rate": 2900}'

# Résultat attendu: 200 OK
```

### Test 2: Vendeur Ne Peut Pas Mettre à Jour
```bash
# Avec session authentifiée en vendeur (role: seller)
curl -X PUT http://localhost:3000/api/exchange-rate \
  -H "Content-Type: application/json" \
  -H "Cookie: nextauth.token=..." \
  -d '{"rate": 2900}'

# Résultat attendu: 403 Forbidden
```

### Test 3: Validation du Taux
```bash
# Taux <= 0 (invalide)
curl -X PUT http://localhost:3000/api/exchange-rate \
  -H "Content-Type: application/json" \
  -d '{"rate": -100}'

# Résultat attendu: 400 Bad Request
# Message: "Le taux doit être un nombre positif."
```

---

## 🚀 Tests de Performance

### Test 1: Temps de Réponse API GET
```bash
time curl http://localhost:3000/api/exchange-rate

# Résultat attendu: < 100ms
```

### Test 2: Temps de Chargement de la Page Admin
```
DevTools -> Network -> Page
Résultat attendu: < 500ms (first paint)
```

### Test 3: Recalcul de N Médicaments
```
Action: Mettre à jour le taux
Observation: Nombre de médicaments recalculés affichés
Résultat attendu: Si < 1 minute pour 100 médicaments
```

---

## 📝 Journal de Test

Remplissez ce formulaire pour chaque test effectué:

```markdown
### Test [Numéro]
- Date: [YYYY-MM-DD]
- Heure: [HH:MM]
- Utilisateur: [admin/vendeur/autre]
- Endpoint/Page: [URL testée]
- Résultat attendu: [Description]
- Résultat obtenu: [Description]
- Status: ✅ PASS / ⚠️ ATTENTION / ❌ FAIL
- Notes: [Commentaires additionnels]

---
```

---

## 🐛 Dépannage Rapide

### Problème: API retourne 404
```
Cause probable: Fichier pages/api/exchange-rate.ts manquant
Solution: Vérifier que le fichier existe dans pages/api/
```

### Problème: Page admin retourne 404
```
Cause probable: Redirection non visible
Solution: Ouvrir DevTools -> Network pour voir les redirects
```

### Problème: Erreur "User not found"
```
Cause probable: Utilisateur admin pas créé en BD
Solution: Exécuter node scripts/create-default-users.js
```

### Problème: Erreur Prisma "Column does not exist"
```
Cause probable: Schéma pas à jour
Solution: Exécuter npx prisma generate
```

### Problème: Styles CSS manquants
```
Cause probable: Tailwind CSS pas compilé
Solution: Redémarrer npm run dev
```

---

## ✨ Cas de Succès Complet

**Scénario**: Admin met à jour le taux, puis consulte les prix

1. ✅ Admin se connecte avec ses identifiants
2. ✅ Admin accède à `/admin/exchange-rate`
3. ✅ Page charge avec le taux actuel (2800)
4. ✅ Admin change le taux à 2900
5. ✅ Admin clique "Mettre à Jour"
6. ✅ API réceptionne la requête PUT
7. ✅ Authentification vérifiée (admin role)
8. ✅ Transaction Prisma exécutée
9. ✅ Taux mis à jour en BD
10. ✅ Médicaments recalculés
11. ✅ AuditLog créée
12. ✅ Admin voit le message de succès
13. ✅ Admin consulte `/admin/medications-prices`
14. ✅ Tous les prix affichent "Taux appliqué: 2900 CDF/USD"
15. ✅ Les prix CDF calculés sont corrects

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez que le serveur s'est lancé (`npm run dev`)
2. Vérifiez que vous pouvez accéder à `/api/exchange-rate`
3. Vérifiez les logs du serveur (terminal)
4. Vérifiez les logs du navigateur (DevTools -> Console)
5. Consultez le fichier `EXCHANGE_RATE_INTEGRATION_COMPLETE.md` pour plus de détails
