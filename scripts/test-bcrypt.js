const bcrypt = require('bcryptjs');

const hash = '$2a$10$qmtt4TummaPj3VvCUakWbecvGy0OuU2Q5hhRcXVu61qiRlTaHfHQy';
const password = 'SuperAdmin123!';

bcrypt.compare(password, hash).then(result => {
  console.log('bcrypt.compare result:', result);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
