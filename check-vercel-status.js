#!/usr/bin/env node

/**
 * Script de vérification de l'état de production Vercel
 * Vérifie si l'application est correctement configurée
 */

const fetch = require('node-fetch');

async function checkProductionStatus() {
  const baseUrl = 'https://afrikapharma-e1iqedbmz-nzamba-simons-projects.vercel.app';
  
  console.log('🔍 Vérification de l\'état de production Vercel\n');
  console.log(`📡 URL: ${baseUrl}\n`);

  const checks = [
    {
      name: 'Health Check API',
      url: `${baseUrl}/api/health`,
      method: 'GET'
    },
    {
      name: 'Setup Users API',
      url: `${baseUrl}/api/setup-users`,
      method: 'GET'
    },
    {
      name: 'Page d\'accueil',
      url: baseUrl,
      method: 'GET'
    }
  ];

  for (const check of checks) {
    console.log(`🧪 Test: ${check.name}`);
    console.log(`   URL: ${check.url}`);
    
    try {
      const response = await fetch(check.url, {
        method: check.method,
        timeout: 10000
      });
      
      console.log(`   Status: ${response.status}`);
      
      const contentType = response.headers.get('content-type');
      console.log(`   Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`   ✅ JSON Response:`, JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        const preview = text.substring(0, 200).replace(/\n/g, ' ');
        console.log(`   📄 HTML Response: ${preview}...`);
        
        if (text.includes('Internal Server Error')) {
          console.log(`   ❌ Erreur serveur détectée`);
        } else if (text.includes('<!doctype html>')) {
          console.log(`   ⚠️  Retourne HTML au lieu de JSON (problème de DB probablement)`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('\n📋 Diagnostic:');
  console.log('');
  console.log('Si vous voyez "HTML au lieu de JSON":');
  console.log('  ❌ La base de données PostgreSQL n\'est pas configurée');
  console.log('  ✅ Solution: Configurer DATABASE_URL sur Vercel');
  console.log('');
  console.log('Si vous voyez des erreurs 500:');
  console.log('  ❌ Variables d\'environnement manquantes');
  console.log('  ✅ Solution: Ajouter NEXTAUTH_SECRET et DATABASE_URL');
  console.log('');
  console.log('📖 Guide complet: ./VERCEL-SETUP-GUIDE.md');
}

// Exécuter si appelé directement
if (require.main === module) {
  checkProductionStatus().catch(console.error);
}

module.exports = { checkProductionStatus };