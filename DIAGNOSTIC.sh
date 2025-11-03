#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║         🔍 DIAGNOSTIC DES APPLICATIONS               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Vérification 1: Ports en utilisation"
echo "========================================"
echo "Port 3001 (App Principale):"
netstat -ano | findstr ":3001" || echo "❌ Port 3001 libre"

echo ""
echo "Port 3000 (AfrikaPharma):"
netstat -ano | findstr ":3000" || echo "❌ Port 3000 libre"

echo ""
echo "📋 Vérification 2: Fichiers importants"
echo "=========================================="
test -f "package.json" && echo "✅ package.json trouvé (racine)" || echo "❌ package.json manquant"
test -f "AfrikaPharma/package.json" && echo "✅ AfrikaPharma/package.json trouvé" || echo "❌ AfrikaPharma/package.json manquant"
test -f "pages/api/auth/[...nextauth].ts" && echo "✅ API auth trouvée" || echo "❌ API auth manquante"

echo ""
echo "📋 Vérification 3: Variables d'environnement"
echo "================================================="
echo "Racine:"
test -f ".env.local" && echo "✅ .env.local trouvé" || echo "❌ .env.local manquant"

echo ""
echo "AfrikaPharma:"
test -f "AfrikaPharma/.env.local" && echo "✅ AfrikaPharma/.env.local trouvé" || echo "❌ AfrikaPharma/.env.local manquant"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Quel est le message d'erreur exact que vous voyez?   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
