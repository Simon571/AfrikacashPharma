# 🚀 GUIDE COMPLET: DEUX APPLICATIONS

## 📍 Vue d'ensemble

Vous avez **DEUX applications** fonctionnelles sur des ports différents:

### 1️⃣ Application Principale (Racine)
```
Emplacement: c:\Users\Public\Documents\Console Afrikapharma\
Port: 3001
URL: http://localhost:3001/login
```

### 2️⃣ AfrikaPharma (Sous-dossier)
```
Emplacement: c:\Users\Public\Documents\Console Afrikapharma\AfrikaPharma\
Port: 3000
URL: http://localhost:3000/login-admin
```

---

## ⚙️ DÉMARRAGE DES DEUX APPLICATIONS

### **Méthode 1: Avec deux terminaux (RECOMMANDÉ)**

#### Terminal 1: Application Principale
```bash
# Racine du projet
cd c:\Users\Public\Documents\Console Afrikapharma

npm run dev
# ✅ Port 3001 lancé
```

#### Terminal 2: AfrikaPharma
```bash
# Sous-dossier AfrikaPharma
cd c:\Users\Public\Documents\Console Afrikapharma\AfrikaPharma

npm run dev
# ✅ Port 3000 lancé
```

Maintenant les DEUX applications tournent en parallèle! 🎉

---

### **Méthode 2: Avec les scripts de démarrage (FACILE)**

#### Windows - Double-cliquez sur:
```
c:\Users\Public\Documents\Console Afrikapharma\AfrikaPharma\START.bat
```

Cela démarre automatiquement AfrikaPharma sur le port 3000!

#### PowerShell - Exécutez:
```bash
cd c:\Users\Public\Documents\Console Afrikapharma\AfrikaPharma
.\START.ps1
```

---

## 🔐 IDENTIFIANTS POUR LES DEUX APPLICATIONS

Les identifiants sont **IDENTIQUES** pour les deux:

| Utilisateur | Mot de passe | Rôle |
|---|---|---|
| `admin` | `Admin123!` | Admin |
| `vendeur` | `vendeur123` | Seller |
| `superadmin` | `SuperAdmin123!` | Admin |

---

## 📱 ACCÈS AUX DEUX APPLICATIONS

### **Application Principale (Port 3001)**
- **Login:** http://localhost:3001/login
- **Dashboard:** http://localhost:3001/dashboard
- **Style:** Interface simple, générique

### **AfrikaPharma (Port 3000)**
- **Admin Login:** http://localhost:3000/login-admin
- **Seller Login:** http://localhost:3000/login-seller
- **Dashboard Admin:** http://localhost:3000/admin-dashboard
- **Dashboard Seller:** http://localhost:3000/seller-dashboard
- **Style:** Interface spécialisée pharmacie

---

## 🔄 ARCHITECTURE

```
Ordinateur
│
├── Terminal 1
│   └── npm run dev (Port 3001)
│       └── Application Principale
│           ├── /login
│           ├── /dashboard
│           └── ...
│
├── Terminal 2
│   └── cd AfrikaPharma && npm run dev (Port 3000)
│       └── AfrikaPharma
│           ├── /login-admin
│           ├── /login-seller
│           ├── /admin-dashboard
│           └── /seller-dashboard
│
└── Navigateur
    ├── localhost:3001 ✅ Application 1
    └── localhost:3000 ✅ Application 2 (simultanément!)
```

---

## 🔧 CORRECTIONS APPLIQUÉES

### Application Principale
**Fichier:** `pages/api/auth/[...nextauth].ts`
- ✅ Fallback utilisateurs par défaut
- ✅ Gestion erreur BD
- ✅ Timeout 5 secondes

### AfrikaPharma
**Fichier:** `AfrikaPharma/src/lib/auth.ts`
- ✅ Fallback utilisateurs par défaut
- ✅ Gestion erreur BD
- ✅ Timeout 5 secondes
- ✅ Scripts de démarrage (START.bat, START.ps1)

---

## 🆘 DÉPANNAGE

### Port 3000 déjà utilisé?
```bash
# Cherchez ce qui utilise le port 3000
netstat -ano | findstr ":3000"

# Tuez le processus (remplacez PID par le numéro)
taskkill /PID <PID> /F
```

### Port 3001 déjà utilisé?
```bash
# Cherchez ce qui utilise le port 3001
netstat -ano | findstr ":3001"

# Tuez le processus
taskkill /PID <PID> /F
```

### "Module not found" dans AfrikaPharma?
```bash
cd AfrikaPharma
npm install
npx prisma generate
npm run dev
```

### Toujours pas accessible après 10 secondes?
```bash
# Arrêtez avec Ctrl+C et relancez
npm run dev
```

---

## ✅ CHECKLIST DE DÉMARRAGE

### Application Principale
- [ ] Terminal 1 ouvert
- [ ] `npm run dev` lancé
- [ ] "ready - started server on 0.0.0.0:3001" visible
- [ ] http://localhost:3001/login accessible
- [ ] Connexion avec `admin` / `Admin123!` réussie

### AfrikaPharma
- [ ] Terminal 2 ouvert (ou START.bat/START.ps1)
- [ ] `npm run dev` lancé dans AfrikaPharma
- [ ] "ready - started server on 0.0.0.0:3000" visible
- [ ] http://localhost:3000/login-admin accessible
- [ ] Connexion avec `admin` / `Admin123!` réussie

---

## 📊 RÉSUMÉ DES DEUX APPLICATIONS

| Aspect | Application Principale | AfrikaPharma |
|---|---|---|
| **Port** | 3001 | 3000 |
| **Route Login** | `/login` | `/login-admin` |
| **Route Login Seller** | N/A | `/login-seller` |
| **Dashboard** | `/dashboard` | `/admin-dashboard`, `/seller-dashboard` |
| **Type** | Générique | Spécialisé Pharmacie |
| **Démarrage** | `npm run dev` | `npm run dev` ou `START.bat` |
| **État** | ✅ Fonctionne | ✅ Corrigée, prêt |

---

## 🎯 PROCHAINES ÉTAPES

### Maintenant
1. ✅ **Ouvrir 2 terminaux**
2. ✅ **Lancer les deux applications**
3. ✅ **Accéder aux deux URLs**
4. ✅ **Se connecter avec les identifiants**

### Après
1. 📝 Développer les features
2. 🧪 Tester les deux applications
3. 🚀 Déployer sur Vercel
4. 📊 Monitoring en production

---

**🎉 Vous êtes prêt à utiliser les deux applications!**

**Allez à:**
- **Port 3001:** http://localhost:3001/login
- **Port 3000:** http://localhost:3000/login-admin
