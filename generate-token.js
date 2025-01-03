const jwt = require('jsonwebtoken');

// These values are directly from your secret (already base64 encoded in the secret)
const secret = 'test-database-password';  // The actual secret, not base64 encoded
const key = 'jleon9_dgraph';

const accessToken = jwt.sign(
  {
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
    iss: 'jwt-user',  // Should match your KongConsumer username
    kid: key,         // Required by your Kong plugin config
    sub: 'jwt-user'   // Should match your KongConsumer username
  },
  secret,
  { algorithm: 'HS256' }
);

console.log('Access Token:', accessToken);