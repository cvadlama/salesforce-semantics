const express = require('express');
const analysisRoutes = require('./src/routes/analysis.routes');
const oauthRoutes = require('./src/routes/oauth.routes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Register routes
app.use('/', analysisRoutes);
app.use('/oauth', oauthRoutes);

// Simple home page with links to the available features
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Salesforce Semantics</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
          h1 { color: #2c3e50; }
          .links { margin: 30px 0; }
          .links a { 
            display: block; 
            margin: 10px 0; 
            padding: 15px; 
            background: #f8f9fa; 
            border-left: 4px solid #3498db; 
            text-decoration: none;
            color: #2c3e50;
          }
          .links a:hover { background: #e9ecef; }
          .auth-info {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <h1>Salesforce Semantics</h1>
        <p>Analyze Salesforce object fields and picklists for semantic similarities using different NLP approaches.</p>
        
        <div class="auth-info">
          <p>Authentication: <strong>${process.env.SF_AUTH_MODE === 'oauth' ? 'OAuth 2.0' : 'Username-Password'}</strong></p>
          <p><a href="/oauth/settings">Manage Authentication Settings</a></p>
        </div>
        
        <h2>Available Features</h2>
        <div class="links">
          <a href="/analyze-nlp/Account?threshold=0.8">
            <strong>NLP Similarity Analysis</strong>
            <div>Analyze field similarities using combined NLP approach</div>
          </a>
          <a href="/analyze-nlp-wink/Account?threshold=0.7">
            <strong>Wink NLP Similarity Analysis</strong>
            <div>Analyze field similarities using Wink NLP's token-based analysis</div>
          </a>
          <a href="/sharing/Account">
            <strong>Sharing Model Analysis</strong>
            <div>View sharing model information for Salesforce objects</div>
          </a>
        </div>
        
        <p>Replace "Account" in the URLs with any Salesforce object API name.</p>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
