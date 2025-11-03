const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('🔄 Réinitialisation du mot de passe pour vendeur...\n');

    const newPassword = await bcrypt.hash('Vendeur123!', 10);

    const user = await prisma.user.update({
      where: { username: 'vendeur' },
      data: { passwordHash: newPassword }
    });

    console.log(`✅ Mot de passe réinitialisé pour: ${user.username}`);
    console.log(`Role: ${user.role}`);
    console.log(`\nNouveaux identifiants:`);
    console.log(`Username: vendeur`);
    console.log(`Password: Vendeur123!`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
