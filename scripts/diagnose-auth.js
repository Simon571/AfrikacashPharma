const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    // Get superadmin user
    const user = await prisma.user.findUnique({
      where: { username: 'superadmin' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('🔐 Testing password verification:');
    console.log('Username:', user.username);
    console.log('Password Hash (first 30 chars):', user.passwordHash.substring(0, 30));
    
    const testPassword = 'SuperAdmin123!';
    
    // Test 1: Direct comparison
    console.log('\n1️⃣ Direct bcrypt.compare:');
    const result1 = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('   Result:', result1 ? '✅ PASS' : '❌ FAIL');
    
    // Test 2: With trim
    console.log('\n2️⃣ Trimmed password:');
    const result2 = await bcrypt.compare(testPassword.trim(), user.passwordHash);
    console.log('   Result:', result2 ? '✅ PASS' : '❌ FAIL');
    
    // Test 3: With toString
    console.log('\n3️⃣ String conversion:');
    const result3 = await bcrypt.compare(String(testPassword), user.passwordHash);
    console.log('   Result:', result3 ? '✅ PASS' : '❌ FAIL');
    
    // Test 4: Character-by-character comparison
    console.log('\n4️⃣ Character comparison:');
    console.log('   Input chars:', [...testPassword].map(c => c.charCodeAt(0)));
    
    if (!result1) {
      console.log('\n⚠️ Password verification failed!');
      console.log('Attempting to regenerate...');
      const newHash = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { username: 'superadmin' },
        data: { passwordHash: newHash }
      });
      console.log('✅ Password regenerated and saved');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
