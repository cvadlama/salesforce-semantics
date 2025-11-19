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
        
        <h2>Choose Your Analysis Type</h2>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #2196f3;">
          <h3 style="margin-top: 0; color: #1976d2;">📊 Multi-Object Analysis (Recommended)</h3>
          <p><strong>Best for:</strong> Auditing multiple objects at once, data governance reviews, org health checks</p>
          <p><strong>How it works:</strong> Scans all specified objects and presents a comprehensive report with a summary table and detailed findings per object. Ideal for identifying duplicate or similar fields across your entire org configuration.</p>
        </div>

        <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #9c27b0;">
          <h3 style="margin-top: 0; color: #7b1fa2;">📋 Single Object Analysis</h3>
          <p><strong>Best for:</strong> Deep-dive into one specific object, quick checks, focused audits</p>
          <p><strong>How it works:</strong> Analyzes just one object's fields and picklist values. Faster and more focused than multi-object analysis.</p>
        </div>

        <h2>Service Cloud - Quick Start Examples</h2>
        
        <h3>Multi-Object Analysis</h3>
        <div class="links">
          <a href="/analyze-multi?objects=Case,Account,Contact&threshold=0.8&method=nlp">
            <strong>Core Service Cloud Objects</strong>
            <div>Case, Account, Contact - Essential objects for support operations</div>
          </a>
          <a href="/analyze-multi?objects=Case,WorkOrder,Asset,ServiceContract&threshold=0.8&method=nlp">
            <strong>Field Service Objects</strong>
            <div>Case, Work Order, Asset, Service Contract - Key field service management objects</div>
          </a>
          <a href="/analyze-multi?objects=Case,Entitlement,ServiceContract,Account&threshold=0.8&method=nlp">
            <strong>Entitlement & Contracts</strong>
            <div>Case, Entitlement, Service Contract, Account - Service agreement objects</div>
          </a>
          <a href="/analyze-multi?objects=Case,Knowledge__kav,ContactRequest,EmailMessage&threshold=0.8&method=nlp">
            <strong>Knowledge & Communications</strong>
            <div>Case, Knowledge, Contact Request, Email Message - Support content and messaging</div>
          </a>
          <a href="/analyze-multi?objects=Account,Contact,User,Lead&threshold=0.8&method=nlp">
            <strong>Customer & User Records</strong>
            <div>Account, Contact, User, Lead - Core relationship objects</div>
          </a>
        </div>

        <h3>Single Object Analysis</h3>
        <div class="links">
          <a href="/analyze-nlp/Case?threshold=0.8">
            <strong>Case Object (NLP)</strong>
            <div>Detailed analysis of Case object fields and picklists</div>
          </a>
          <a href="/analyze-nlp/Account?threshold=0.8">
            <strong>Account Object (NLP)</strong>
            <div>Detailed analysis of Account object fields and picklists</div>
          </a>
          <a href="/analyze-nlp-wink/Case?threshold=0.7">
            <strong>Case Object (Wink NLP)</strong>
            <div>Alternative token-based analysis for Case object</div>
          </a>
        </div>

        <h3>Other Features</h3>
        <div class="links">
          <a href="/sharing/Case">
            <strong>Sharing Model Analysis</strong>
            <div>View sharing model information for any Salesforce object (example: Case)</div>
          </a>
        </div>

        <h2>Customization Guide</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">URL Parameters</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #e0e0e0;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ccc;">Parameter</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ccc;">Usage</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ccc;">Example</th>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><code>objects</code></td>
              <td style="padding: 8px; border: 1px solid #ccc;">Comma-separated object names (multi-object only)</td>
              <td style="padding: 8px; border: 1px solid #ccc;"><code>?objects=Case,Account,Contact</code></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><code>threshold</code></td>
              <td style="padding: 8px; border: 1px solid #ccc;">Similarity threshold (0-1). Higher = stricter</td>
              <td style="padding: 8px; border: 1px solid #ccc;"><code>?threshold=0.75</code></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><code>method</code></td>
              <td style="padding: 8px; border: 1px solid #ccc;">Analysis method: <code>nlp</code> or <code>wink</code></td>
              <td style="padding: 8px; border: 1px solid #ccc;"><code>?method=wink</code></td>
            </tr>
          </table>
          
          <h4>Tips:</h4>
          <ul style="margin: 10px 0;">
            <li><strong>Threshold 0.8</strong> - Recommended for most use cases (default for NLP)</li>
            <li><strong>Threshold 0.7</strong> - Catches more potential duplicates but may include false positives (default for Wink)</li>
            <li><strong>Threshold 0.9</strong> - Very strict, only finds highly similar fields</li>
            <li><strong>NLP method</strong> - Good all-around performance, uses Jaro-Winkler + string similarity</li>
            <li><strong>Wink method</strong> - Token-based analysis, better for complex field names</li>
          </ul>
          
          <h4>Custom Object Examples:</h4>
          <ul style="margin: 10px 0;">
            <li>Single custom object: <code>/analyze-nlp/MyCustomObject__c?threshold=0.8</code></li>
            <li>Multiple custom objects: <code>/analyze-multi?objects=Custom1__c,Custom2__c,Custom3__c</code></li>
            <li>Mix standard & custom: <code>/analyze-multi?objects=Case,Account,MyCustom__c</code></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
