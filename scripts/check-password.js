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
      return;
    }
    
    console.log('User found:', {
      username: user.username,
      role: user.role,
      passwordHash: user.passwordHash.substring(0, 20) + '...'
    });
    
    // Test the password
    const testPassword = 'SuperAdmin123!';
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('Password test (SuperAdmin123!):', isValid ? '✅ VALID' : '❌ INVALID');
    
    // If invalid, let's try to rehash and check
    if (!isValid) {
      console.log('\nTrying to rehash the password...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash would be:', newHash.substring(0, 20) + '...');
      const newIsValid = await bcrypt.compare(testPassword, newHash);
      console.log('New hash verification:', newIsValid ? '✅ VALID' : '❌ INVALID');
      
      // Update the user
      console.log('\nUpdating user password...');
      await prisma.user.update({
        where: { username: 'superadmin' },
        data: { passwordHash: newHash }
      });
      console.log('✅ Password updated');
    }
    
    // Verify again
    const userAfter = await prisma.user.findUnique({
      where: { username: 'superadmin' }
    });
    const finalTest = await bcrypt.compare(testPassword, userAfter.passwordHash);
    console.log('Final verification:', finalTest ? '✅ VALID' : '❌ INVALID');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
