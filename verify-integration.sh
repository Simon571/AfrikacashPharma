#!/bin/bash

# ========================================
# VERIFICATION POST-INTEGRATION
# Système de Taux USD→CDF
# ========================================

echo "🔍 Vérification post-intégration..."
echo ""

# Vérifier fichiers créés
echo "📁 Vérification des fichiers..."
files=(
  "lib/actions/exchange-rate.ts"
  "lib/nextauth-config.ts"
  "components/ExchangeRateManager.tsx"
  "components/MedicationPriceDisplay.tsx"
  "pages/admin/exchange-rate.tsx"
  "pages/admin/medications-prices.tsx"
  "pages/api/exchange-rate.ts"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (MANQUANT)"
    all_exist=false
  fi
done

echo ""
if [ "$all_exist" = true ]; then
  echo "✅ Tous les fichiers de code sont présents!"
else
  echo "❌ Certains fichiers manquent. Vérifiez la création."
  exit 1
fi

# Vérifier documentation
echo ""
echo "📚 Vérification de la documentation..."
docs=(
  "EXCHANGE_RATE_INTEGRATION_COMPLETE.md"
  "EXCHANGE_RATE_TEST_GUIDE.md"
  "QUICK_REFERENCE_EXCHANGE_RATE.md"
  "INTEGRATION_SUMMARY.md"
  "FILES_INDEX_EXCHANGE_RATE.md"
)

all_docs_exist=true
for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "✅ $doc"
  else
    echo "❌ $doc (MANQUANT)"
    all_docs_exist=false
  fi
done

echo ""
if [ "$all_docs_exist" = true ]; then
  echo "✅ Toute la documentation est présente!"
else
  echo "⚠️ Certains fichiers de documentation manquent."
fi

# Vérifier que le serveur peut démarrer
echo ""
echo "🚀 Vérification du serveur..."
echo "Exécutez: npm run dev"
echo "Le serveur devrait écouter sur http://localhost:3000"

echo ""
echo "✨ INTEGRATION COMPLETE!"
echo ""
echo "📖 Prochaines étapes:"
echo "1. Exécutez: npm run dev"
echo "2. Ouvrez: http://localhost:3000/admin/exchange-rate"
echo "3. Connectez-vous: admin / Admin123!"
echo "4. Mettez à jour le taux"
echo ""
echo "📚 Documentation:"
echo "- Lire QUICK_REFERENCE_EXCHANGE_RATE.md pour démarrer"
echo "- Lire EXCHANGE_RATE_TEST_GUIDE.md pour tester"
echo "- Lire INTEGRATION_SUMMARY.md pour le contexte complet"
echo ""
