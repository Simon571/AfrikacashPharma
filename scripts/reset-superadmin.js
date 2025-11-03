const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetSuperAdmin() {
  try {
    console.log('🔄 Réinitialisation du mot de passe pour superadmin...\n');

    const newPassword = await bcrypt.hash('SuperAdmin123!', 10);

    const user = await prisma.user.update({
      where: { username: 'superadmin' },
      data: { passwordHash: newPassword }
    });

    console.log(`✅ Mot de passe réinitialisé`);
    console.log(`Username: ${user.username}`);
    console.log(`Nouveau Hash: ${user.passwordHash}`);
    console.log(`\nNouveaux identifiants:`);
    console.log(`Username: superadmin`);
    console.log(`Password: SuperAdmin123!\n`);

    // Test immédiatement
    console.log('🧪 Test immédiat du nouveau mot de passe...');
    const testResult = await bcrypt.compare('SuperAdmin123!', user.passwordHash);
    console.log(`Résultat: ${testResult ? '✅ MATCH' : '❌ NO MATCH'}\n`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetSuperAdmin();
