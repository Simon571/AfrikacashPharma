const http = require('http');

const data = JSON.stringify({
  username: 'superadmin',
  password: 'SuperAdmin123!'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/callback/credentials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Cookie': ''
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Response body:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();
