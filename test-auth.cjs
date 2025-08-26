const http = require('http');

console.log('Testing NextAuth providers endpoint...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/providers',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:');
    console.log(data);
    console.log('\n--- Test complete ---');
    process.exit(0);
  });
});

req.on('timeout', () => {
  console.log('Request timed out');
  req.destroy();
  process.exit(1);
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
  process.exit(1);
});

req.end();
