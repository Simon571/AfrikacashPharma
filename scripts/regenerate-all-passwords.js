const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔄 Regenerating all user passwords...\n');
    
    const users = [
      { username: 'superadmin', password: 'SuperAdmin123!' },
      { username: 'admin', password: 'Admin123!' },
      { username: 'vendeur', password: 'Vendeur123!' }
    ];
    
    for (const { username, password } of users) {
      // Generate new hash
      const newHash = await bcrypt.hash(password, 10);
      
      // Verify it works
      const testResult = await bcrypt.compare(password, newHash);
      
      if (!testResult) {
        console.log(`❌ ${username}: Hash verification failed!`);
        continue;
      }
      
      // Update in database
      await prisma.user.update({
        where: { username },
        data: { passwordHash: newHash }
      });
      
      console.log(`✅ ${username}: Password regenerated`);
      console.log(`   Hash: ${newHash}`);
      console.log(`   Verification: ✅ OK\n`);
    }
    
    console.log('🎉 All passwords regenerated successfully!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
