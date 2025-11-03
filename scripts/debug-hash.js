const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugPasswordHash() {
  try {
    console.log('🔍 DEBUG DU HASH DE SUPERADMIN\n');

    const user = await prisma.user.findUnique({ 
      where: { username: 'superadmin' }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('Utilisateur trouvé:');
    console.log(`  Username: ${user.username}`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Hash stocké: ${user.passwordHash}`);
    console.log(`  Hash length: ${user.passwordHash.length}\n`);

    // Test 1: Vérifier si c'est un vrai hash bcrypt
    const isBcrypt = user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2x$') || user.passwordHash.startsWith('$2y$');
    console.log(`Est un hash bcrypt valide: ${isBcrypt ? '✅ OUI' : '❌ NON'}\n`);

    // Test 2: Tester différents mots de passe
    const testPasswords = [
      'SuperAdmin123!',
      'superadmin123',
      'SuperAdmin',
      user.passwordHash // essayer le hash lui-même comme mot de passe
    ];

    console.log('Test de différents mots de passe:\n');
    for (const pwd of testPasswords) {
      try {
        const result = await bcrypt.compare(pwd, user.passwordHash);
        console.log(`  "${pwd}": ${result ? '✅ MATCH' : '❌ NO MATCH'}`);
      } catch (error) {
        console.log(`  "${pwd}": ❌ ERREUR - ${error.message}`);
      }
    }

    console.log('\n🔄 Recommandation: Réinitialiser le hash avec le bon mot de passe\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugPasswordHash();
