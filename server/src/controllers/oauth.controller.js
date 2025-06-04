const jsforce = require('jsforce');
const { conn } = require('../config/database');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// OAuth configuration
const oauth2 = new jsforce.OAuth2({
  clientId: process.env.SF_OAUTH_CLIENT_ID,
  clientSecret: process.env.SF_OAUTH_CLIENT_SECRET,
  redirectUri: process.env.SF_OAUTH_REDIRECT_URI || 'http://localhost:3001/oauth/callback'
});

class OAuthController {
  /**
   * Initiate OAuth flow by redirecting to Salesforce login
   */
  authorize(req, res) {
    const authUrl = oauth2.getAuthorizationUrl({ scope: 'api refresh_token' });
    res.redirect(authUrl);
  }

  /**
   * Handle OAuth callback from Salesforce
   */
  async callback(req, res) {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('Authorization code is missing');
    }

    try {
      // Exchange authorization code for access token
      const conn = new jsforce.Connection({ oauth2 });
      const userInfo = await conn.authorize(code);
      
      // Information to save
      const oauthInfo = {
        accessToken: conn.accessToken,
        refreshToken: conn.refreshToken,
        instanceUrl: conn.instanceUrl,
        userInfo: {
          id: userInfo.id,
          username: userInfo.username,
          organizationId: userInfo.organizationId
        }
      };

      // Update .env file with OAuth tokens
      this.updateEnvFile({
        SF_OAUTH_TOKEN: oauthInfo.accessToken,
        SF_OAUTH_REFRESH_TOKEN: oauthInfo.refreshToken,
        SF_OAUTH_INSTANCE_URL: oauthInfo.instanceUrl,
        SF_AUTH_MODE: 'oauth'
      });

      res.send(`
        <html>
          <head>
            <title>OAuth Authentication Successful</title>
            <style>
              body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
              .success { color: #27ae60; }
              pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
              .button { 
                display: inline-block; 
                padding: 10px 20px; 
                background: #3498db; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px; 
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <h1><span class="success">✓</span> OAuth Authentication Successful</h1>
            <p>Successfully authenticated with Salesforce. You can now close this window and use the application.</p>
            <h2>Connection Information:</h2>
            <ul>
              <li><strong>Username:</strong> ${userInfo.username}</li>
              <li><strong>Instance URL:</strong> ${conn.instanceUrl}</li>
              <li><strong>Organization ID:</strong> ${userInfo.organizationId}</li>
            </ul>
            <p>OAuth credentials have been saved. The application will now use OAuth authentication.</p>
            <a href="/" class="button">Return to Application</a>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('OAuth Error:', error);
      res.status(500).send(`
        <html>
          <head>
            <title>OAuth Error</title>
            <style>
              body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
              .error { color: #e74c3c; }
              pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
            </style>
          </head>
          <body>
            <h1><span class="error">✗</span> OAuth Error</h1>
            <p>An error occurred during the OAuth process:</p>
            <pre>${error.message}</pre>
            <p>Please try again or contact the administrator.</p>
          </body>
        </html>
      `);
    }
  }

  /**
   * Update .env file with new OAuth credentials
   */
  updateEnvFile(newValues) {
    const envPath = path.resolve(process.cwd(), '.env');
    
    try {
      // Read existing .env file
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Update or add each new value
      Object.entries(newValues).forEach(([key, value]) => {
        // Check if the key already exists in the file
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          // Replace existing value
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          // Add new key-value pair
          envContent += `\n${key}=${value}`;
        }
      });
      
      // Write updated content back to .env file
      fs.writeFileSync(envPath, envContent);
      console.log('Updated .env file with OAuth credentials');
      
      // Refresh environment variables in current process
      Object.entries(newValues).forEach(([key, value]) => {
        process.env[key] = value;
      });
    } catch (error) {
      console.error('Error updating .env file:', error);
    }
  }

  /**
   * Provide an interface to switch between auth modes
   */
  authSettings(req, res) {
    const currentMode = process.env.SF_AUTH_MODE || 'password';
    const username = process.env.SF_USERNAME || 'Not configured';
    const oauthUser = 'OAuth user' + (process.env.SF_OAUTH_TOKEN ? ' (configured)' : ' (not configured)');
    
    res.send(`
      <html>
        <head>
          <title>Authentication Settings</title>
          <style>
            body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
            .card {
              border: 1px solid #e9ecef;
              border-radius: 5px;
              padding: 20px;
              margin-bottom: 20px;
              background-color: #f8f9fa;
            }
            .active { border-left: 4px solid #27ae60; }
            .inactive { border-left: 4px solid #95a5a6; }
            .button { 
              display: inline-block; 
              padding: 10px 20px; 
              background: #3498db; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
            }
            h1 { color: #2c3e50; }
            h2 { color: #34495e; margin-top: 0; }
          </style>
        </head>
        <body>
          <h1>Salesforce Authentication Settings</h1>
          
          <div class="card ${currentMode === 'password' ? 'active' : 'inactive'}">
            <h2>Username-Password Authentication</h2>
            <p>Current username: <strong>${username}</strong></p>
            <p>This authentication method uses a username and password stored in your .env file.</p>
            <form action="/oauth/set-mode" method="post">
              <input type="hidden" name="mode" value="password">
              <button class="button" type="submit" ${currentMode === 'password' ? 'disabled' : ''}>
                ${currentMode === 'password' ? 'Currently Active' : 'Switch to Password Auth'}
              </button>
            </form>
          </div>
          
          <div class="card ${currentMode === 'oauth' ? 'active' : 'inactive'}">
            <h2>OAuth Authentication</h2>
            <p>OAuth user: <strong>${oauthUser}</strong></p>
            <p>This authentication method uses OAuth 2.0 to connect to Salesforce securely without storing your password.</p>
            <p>
              <a href="/oauth/authorize" class="button">Authorize with Salesforce</a>
              ${currentMode !== 'oauth' ? `
                <form action="/oauth/set-mode" method="post" style="display: inline-block; margin-left: 10px;">
                  <input type="hidden" name="mode" value="oauth">
                  <button class="button" type="submit" ${!process.env.SF_OAUTH_TOKEN ? 'disabled' : ''}>
                    Switch to OAuth Auth
                  </button>
                </form>
              ` : '<span style="margin-left: 10px; color: #27ae60;">Currently Active</span>'}
            </p>
          </div>
          
          <p><a href="/">&larr; Back to Application</a></p>
        </body>
      </html>
    `);
  }

  /**
   * Set the authentication mode
   */
  async setAuthMode(req, res) {
    const { mode } = req.body;
    
    if (mode !== 'password' && mode !== 'oauth') {
      return res.status(400).send('Invalid authentication mode');
    }
    
    // OAuth mode requires tokens
    if (mode === 'oauth' && !process.env.SF_OAUTH_TOKEN) {
      return res.status(400).send('OAuth not configured. Please authorize with Salesforce first.');
    }
    
    try {
      this.updateEnvFile({ SF_AUTH_MODE: mode });
      res.redirect('/oauth/settings');
    } catch (error) {
      console.error('Error setting auth mode:', error);
      res.status(500).send('Error setting authentication mode');
    }
  }
}

module.exports = new OAuthController();
