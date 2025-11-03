const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('✅ Verifying all regenerated passwords:\n');
    
    const credentials = [
      { username: 'superadmin', password: 'SuperAdmin123!' },
      { username: 'admin', password: 'Admin123!' },
      { username: 'vendeur', password: 'Vendeur123!' }
    ];
    
    for (const { username, password } of credentials) {
      const user = await prisma.user.findUnique({
        where: { username }
      });
      
      if (!user) {
        console.log(`❌ ${username}: User not found`);
        continue;
      }
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      console.log(`${username}:`);
      console.log(`  Password: ${password}`);
      console.log(`  Hash: ${user.passwordHash.substring(0, 40)}...`);
      console.log(`  Verification: ${isValid ? '✅ VALID' : '❌ INVALID'}\n`);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
