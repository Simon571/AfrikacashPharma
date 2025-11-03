const axios = require('axios').default;
const qs = require('qs');

const base = 'http://localhost:3001';

async function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

async function main(){
  try{
    console.log(new Date().toISOString(), '1) Creating session via credentials (username superadmin)');
  // Fetch CSRF token
  console.log(new Date().toISOString(), 'fetching csrf');
  const csrfRes = await axios.get(base + '/api/auth/csrf');
  console.log(new Date().toISOString(), 'csrf fetched');
  const csrfToken = csrfRes.data.csrfToken;
  const data = qs.stringify({ csrfToken, username: 'superadmin', password: 'SuperAdmin!234', role: 'owner' });
  const loginRes = await axios.post(base + '/api/auth/callback/credentials', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, maxRedirects: 0, validateStatus: s=> s===302 || s===200 });
  const cookies = loginRes.headers['set-cookie'];
  console.log('login status', loginRes.status);

  if(!cookies) { console.log('No cookies returned; login may have redirected'); }

  const cookieHeader = cookies ? cookies.map(c=>c.split(';')[0]).join('; ') : '';

  console.log(new Date().toISOString(), '2) Call generate endpoint');
  const gen = await axios.get(base + '/api/auth/totp/generate', { headers: { cookie: cookieHeader } , timeout: 5000});
  console.log(new Date().toISOString(), 'generate:', gen.data);

    console.log('3) wait 1s then prompt to scan QR and enter token (automated will try to compute via otpauth?)');
    // If otpauth_url is present, extract secret and compute TOTP via otplib locally
    const otpauth = gen.data.otpauth_url;
    const m = otpauth.match(/secret=([A-Z2-7]+)/i);
    if(!m){ console.log('No secret found in otpauth_url'); return }
    const secret = m[1];
    console.log('secret', secret);

    const otplib = require('otplib');
    const token = otplib.authenticator.generate(secret);
    console.log('generated token', token);

  console.log(new Date().toISOString(), '4) Verify token');
  const verify = await axios.post(base + '/api/auth/totp/verify', { token }, { headers: { cookie: cookieHeader }, timeout: 5000 });
  console.log(new Date().toISOString(), 'verify', verify.data);

    console.log('5) Attempt login requiring totp');
    const data2 = qs.stringify({ username: 'superadmin', password: 'SuperAdmin!234', role: 'owner', totp: token });
    const loginRes2 = await axios.post(base + '/api/auth/callback/credentials', data2, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, maxRedirects: 0, validateStatus: s=> s===302 || s===200 });
    console.log('final login status', loginRes2.status);

    console.log('Done');
  }catch(err){
    if (err.response) {
      console.error('error status', err.response.status);
      console.error('error data', err.response.data);
      console.error('error headers', err.response.headers);
    } else {
      console.error('error', err.message);
    }
  }
}

main();
