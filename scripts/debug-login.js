const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    console.log('🔍 DEBUG COMPLET DE LA CONNEXION\n');
    console.log('==============================\n');

    // 1. Vérifier l'utilisateur dans la BD
    console.log('1️⃣  Recherche de l\'utilisateur "superadmin"...');
    const user = await prisma.user.findUnique({ 
      where: { username: 'superadmin' }
    });

    if (!user) {
      console.log('   ❌ ERREUR: Utilisateur non trouvé\n');
      return;
    }

    console.log('   ✅ Utilisateur trouvé');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Password Hash présent: ${user.passwordHash ? '✅ OUI' : '❌ NON'}`);
    console.log(`   - TOTP Enabled: ${user.totpEnabled}\n`);

    // 2. Tester la vérification du mot de passe
    console.log('2️⃣  Vérification du mot de passe...');
    const testPassword = 'SuperAdmin123!';
    const passwordValid = await bcrypt.compare(testPassword, user.passwordHash);
    
    console.log(`   - Mot de passe testé: ${testPassword}`);
    console.log(`   - Hash stocké: ${user.passwordHash.substring(0, 30)}...`);
    console.log(`   - Résultat: ${passwordValid ? '✅ VALIDE' : '❌ INVALIDE'}\n`);

    if (!passwordValid) {
      console.log('   ⚠️ Le mot de passe ne correspond pas!');
      console.log('   Essayez de réinitialiser avec le script reset-vendeur.js\n');
      return;
    }

    // 3. Vérifier la réponse NextAuth
    console.log('3️⃣  Réponse que NextAuth devrait retourner...');
    const authResponse = {
      id: user.id,
      name: user.username,
      role: user.role
    };
    console.log('   ' + JSON.stringify(authResponse, null, 4) + '\n');

    // 4. Vérifier la configuration NextAuth
    console.log('4️⃣  Vérification des variables d\'environnement...');
    console.log(`   - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
    console.log(`   - NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Configuré' : '❌ Manquant'}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV}\n`);

    console.log('✅ DEBUG COMPLET - Aucun problème détecté au niveau du backend\n');
    console.log('ℹ️  Si la connexion ne fonctionne toujours pas:');
    console.log('   1. Vérifiez la console du navigateur (F12)');
    console.log('   2. Vérifiez les logs du serveur (npm run dev)');
    console.log('   3. Vérifiez que SessionProvider est configuré dans layout.tsx');
    console.log('   4. Vérifiez que signIn("credentials", ...) est appelé correctement\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
