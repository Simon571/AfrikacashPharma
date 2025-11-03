const bcrypt = require('bcryptjs');

const hash = '$2a$10$qmtt4TummaPj3vLlqSWTVO6Y.Qqrfog3AhyASYvhb.vavr7qE/y3K';
const password = 'SuperAdmin123!';

bcrypt.compare(password, hash).then(result => {
  console.log('Hash from DB: ' + hash);
  console.log('Password: ' + password);
  console.log('Result: ' + (result ? '✅ MATCH' : '❌ NO MATCH'));
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
