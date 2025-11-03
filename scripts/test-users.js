const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Vérification des utilisateurs...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        totpEnabled: true,
        createdAt: true,
      }
    });

    console.log('📋 Utilisateurs trouvés:');
    console.log('================================');
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log(`TOTP Enabled: ${user.totpEnabled}`);
      console.log(`Created At: ${user.createdAt}`);
      console.log('---');
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé!');
    } else {
      console.log(`✅ ${users.length} utilisateurs trouvés`);
    }

    // Test de connexion avec bcrypt
    console.log('\n🔑 Test de hachage de mot de passe:');
    const testPassword = 'SuperAdmin123!';
    const hash = await bcrypt.hash(testPassword, 10);
    console.log(`Original: ${testPassword}`);
    console.log(`Hash: ${hash}`);
    const isValid = await bcrypt.compare(testPassword, hash);
    console.log(`Vérification: ${isValid ? '✅ OK' : '❌ FAIL'}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
