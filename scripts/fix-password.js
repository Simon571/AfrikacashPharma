const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'superadmin' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('Current hash from DB:', user.passwordHash);
    console.log('Hash length:', user.passwordHash.length);
    
    // Test with current hash
    const testPassword = 'SuperAdmin123!';
    const currentTest = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('Current hash test:', currentTest ? '✅ VALID' : '❌ INVALID');
    
    if (!currentTest) {
      console.log('\n🔄 Regenerating password hash...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash:', newHash);
      
      // Verify new hash works
      const newTest = await bcrypt.compare(testPassword, newHash);
      console.log('New hash test:', newTest ? '✅ VALID' : '❌ INVALID');
      
      // Update in database
      await prisma.user.update({
        where: { username: 'superadmin' },
        data: { passwordHash: newHash }
      });
      console.log('✅ Password updated in database');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
