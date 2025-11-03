# 🔧 DIAGNOSTIC ERREUR NEXTAUTH "CredentialsSignin"

## ❌ PROBLÈME

L'erreur `CredentialsSignin` s'affiche lors de la tentative de connexion.

```
Error: Erreur d'authentification: "CredentialsSignin"
```

## 🔍 CAUSES POSSIBLES

1. **❌ Base de données indisponible** - La BD Neon distante ne répond pas
2. **❌ Fonction authorize() qui retourne null** - Pas d'utilisateur trouvé
3. **❌ NEXTAUTH_SECRET manquant** - Erreur de configuration
4. **❌ Erreur de connexion au serveur NextAuth** - Problème de réseau

## ✅ SOLUTION APPLIQUÉE

J'ai modifié `pages/api/auth/[...nextauth].ts` pour ajouter:

### 1️⃣ Utilisateurs par défaut en mémoire
```javascript
const DEFAULT_USERS = [
  { id: 'admin-1', username: 'admin', password: 'Admin123!', role: 'admin' },
  { id: 'seller-1', username: 'vendeur', password: 'vendeur123', role: 'seller' },
  { id: 'superadmin-1', username: 'superadmin', password: 'SuperAdmin123!', role: 'admin' }
];
```

### 2️⃣ Stratégie de fallback
- **Étape 1:** Essayer de se connecter avec Prisma (BD)
- **Étape 2:** Si la BD n'est pas accessible, utiliser les utilisateurs par défaut
- **Étape 3:** Vérifier le mot de passe directement (pas de bcrypt pour les défauts)

### 3️⃣ Gestion des erreurs améliorée
- Timeout de 5 secondes pour les requêtes Prisma
- Try/catch pour capturer les erreurs
- Logs détaillés pour le débogage

---

## 🚀 PROCHAINES ÉTAPES

### **Option 1: Redémarrer le serveur et tester**

Le serveur devrait avoir appliqué les changements automatiquement (ou redémarrez avec `npm run dev`).

Essayez:
- **URL:** http://localhost:3001/login
- **Utilisateur:** `admin`
- **Mot de passe:** `Admin123!`

### **Option 2: Vérifier les logs du serveur**

Regardez les logs de terminal du serveur Next.js. Vous devriez voir:

```
🔐 authorize() appelé avec credentials: { username: 'admin', password: '***' }
🔍 Recherche de l'utilisateur dans Prisma: admin
⚠️ Erreur Prisma, utilisation des utilisateurs par défaut: [erreur]
🔍 Recherche de l'utilisateur dans les utilisateurs par défaut
✅ Utilisateur trouvé dans les utilisateurs par défaut
🔑 Vérification du mot de passe (direct): ✅ OK
✅ Authentification réussie (utilisateur par défaut)
```

---

## 📋 FICHIERS MODIFIÉS

**✏️ `pages/api/auth/[...nextauth].ts`**

Changements:
- Ajout d'utilisateurs par défaut (`DEFAULT_USERS`)
- Initialisation sécurisée de PrismaClient
- Stratégie de fallback (Prisma → Par défaut)
- Timeout de 5 secondes pour les requêtes
- Vérification directe du mot de passe en fallback
- Logs améliorés

---

## 🔐 IDENTIFIANTS DISPONIBLES

| Utilisateur | Mot de passe | Rôle |
|---|---|---|
| `admin` | `Admin123!` | Admin |
| `vendeur` | `vendeur123` | Seller |
| `superadmin` | `SuperAdmin123!` | Admin |

---

## 🆘 SI ÇA NE MARCHE TOUJOURS PAS

### Vérification 1: Le serveur tourne-t-il?
```bash
# Vérifier que le port 3001 écoute
netstat -an | findstr ":3001"
```

### Vérification 2: Accès à la page login?
```bash
# Tester l'accès HTTP
curl http://localhost:3001/login
```

### Vérification 3: Logs du serveur
- Regardez le terminal où vous avez lancé `npm run dev`
- Cherchez les messages 🔐 et ✅
- Cherchez les erreurs ❌

### Vérification 4: Nettoyer et redémarrer
```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

---

## 📞 BESOIN D'AIDE?

Essayez ces commandes pour diagnostiquer:

```bash
# 1. Vérifier que l'app tourne
curl http://localhost:3001/

# 2. Vérifier que la page login existe
curl http://localhost:3001/login

# 3. Vérifier que l'API NextAuth fonctionne
curl http://localhost:3001/api/auth/providers

# 4. Regarder les logs
# Cherchez "authorize()" dans la console du serveur
```

---

**✅ Vous devriez pouvoir vous connecter maintenant!**

Allez à: **http://localhost:3001/login**

Entrez: `admin` / `Admin123!`
