const jsforce = require('jsforce');
require('dotenv').config();

// Username-password authentication
const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

// OAuth authentication
const SF_OAUTH_CLIENT_ID = process.env.SF_OAUTH_CLIENT_ID;
const SF_OAUTH_CLIENT_SECRET = process.env.SF_OAUTH_CLIENT_SECRET;
const SF_OAUTH_REDIRECT_URI = process.env.SF_OAUTH_REDIRECT_URI || 'http://localhost:3001/oauth/callback';
const SF_OAUTH_TOKEN = process.env.SF_OAUTH_TOKEN;
const SF_OAUTH_REFRESH_TOKEN = process.env.SF_OAUTH_REFRESH_TOKEN;
const SF_OAUTH_INSTANCE_URL = process.env.SF_OAUTH_INSTANCE_URL;

// Determine authentication mode
const AUTH_MODE = process.env.SF_AUTH_MODE || 'password'; // 'password' or 'oauth'

// Create connection based on auth mode
let conn;
if (AUTH_MODE === 'oauth' && SF_OAUTH_TOKEN && SF_OAUTH_INSTANCE_URL) {
  conn = new jsforce.Connection({
    oauth2: {
      clientId: SF_OAUTH_CLIENT_ID,
      clientSecret: SF_OAUTH_CLIENT_SECRET,
      redirectUri: SF_OAUTH_REDIRECT_URI
    },
    instanceUrl: SF_OAUTH_INSTANCE_URL,
    accessToken: SF_OAUTH_TOKEN,
    refreshToken: SF_OAUTH_REFRESH_TOKEN
  });
} else {
  conn = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL
  });
}

module.exports = {
  conn,
  SF_USERNAME,
  SF_PASSWORD,
  SF_LOGIN_URL,
  AUTH_MODE,
  SF_OAUTH_INSTANCE_URL
};
