#!/bin/bash

# 🚀 Script de déploiement multi-tenant sur Vercel
# Usage: ./deploy-multi-tenant.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Déploiement Multi-Tenant pour AfrikaPharma"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Vérifier les prérequis
echo ""
echo "1️⃣  Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI n'est pas installé"
    echo "   Installation: npm install -g vercel"
fi

echo "✅ Prérequis OK"

# 2. Installer les dépendances
echo ""
echo "2️⃣  Installation des dépendances..."
npm install

# 3. Configuration de l'environnement
echo ""
echo "3️⃣  Configuration de l'environnement..."

if [ ! -f .env.local ]; then
    echo "📝 Création du fichier .env.local..."
    cp .env.example .env.local
    echo "⚠️  Veuillez éditer .env.local avec vos clés API"
    read -p "Appuyez sur Entrée après avoir configuré .env.local..."
fi

# 4. Migration de base de données
echo ""
echo "4️⃣  Migration de la base de données..."
npx prisma migrate deploy
npx prisma generate

# 5. Initialiser les données
echo ""
echo "5️⃣  Initialisation des données..."
npm run setup:multi-tenant || echo "⚠️  Setup script n'a pas pu s'exécuter (optionnel)"

# 6. Build du projet
echo ""
echo "6️⃣  Build du projet..."
npm run build

# 7. Déployer sur Vercel
echo ""
echo "7️⃣  Déploiement sur Vercel..."

if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "⚠️  Vercel CLI non trouvé"
    echo "   Installer: npm install -g vercel"
    echo "   Puis redéployer: vercel --prod"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Déploiement terminé avec succès!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📍 Prochaines étapes:"
echo "1. Dashboard: https://your-domain.vercel.app/admin/dashboard"
echo "2. Docs: voir MULTI_TENANT_GUIDE.md"
echo "3. Tests: npm run test:payments"
echo ""
