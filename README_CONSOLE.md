# Console Afrikapharma - Administration

## Vue d'ensemble
Console d'administration pour superviser et gérer les données de l'application AfrikaPharma.

## URL
- **Production**: https://console-afrikapharma.vercel.app
- **Développement**: http://localhost:3000

## Rôles autorisés
- `superadmin`: Accès complet
- `admin`: Gestion complète
- `supervisor`: Lecture et rapports

## Structure
- `/app/admin`: Pages d'administration
- `/app/api/admin`: API d'administration
- `/lib/services/admin`: Services métier

## Démarrage
```bash
npm install
npm run dev
```

## Déploiement
- Branch: `main`
- Vercel Project: `console-afrikapharma`
- Auto-deploy: ✅ Activé
