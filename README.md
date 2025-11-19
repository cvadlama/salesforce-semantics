# Salesforce Semantics

A Node.js application that analyzes Salesforce object fields and picklists for semantic similarities using different NLP approaches.

## Features

- Analyze field label similarities using combined NLP approach (Jaro-Winkler + string similarity)
- Analyze field label similarities using Wink NLP's token-based analysis
- Analyze picklist value similarities
- View sharing model information for Salesforce objects
- Support for both Username-Password and OAuth 2.0 authentication

## Setup

1. Clone the repository
2. Run \`npm install\`
3. Create a \`.env\` file with your authentication settings:

   ### For Username-Password Authentication:
   ```
   SF_USERNAME=your_username
   SF_PASSWORD=your_password
   SF_LOGIN_URL=your_mydomain_url
   SF_AUTH_MODE=password
   PORT=3001
   ```

   ### For OAuth 2.0 Authentication:
   ```
   SF_OAUTH_CLIENT_ID=your_connected_app_client_id
   SF_OAUTH_CLIENT_SECRET=your_connected_app_client_secret
   SF_OAUTH_REDIRECT_URI=http://localhost:3001/oauth/callback
   SF_AUTH_MODE=oauth
   PORT=3001
   ```
   
4. Run \`npm run dev\` for development or \`npm start\` for production

## Authentication Options

### Username-Password Authentication
The application supports traditional username-password authentication, which is simple to set up but requires storing credentials in the `.env` file.

### OAuth 2.0 Authentication
For better security, you can use OAuth 2.0 authentication:

1. Create a Connected App in your Salesforce org with the OAuth settings:
   - Callback URL: `http://localhost:3001/oauth/callback` (or your custom URL)
   - OAuth Scopes: "Access and manage your data (api)" and "Perform requests on your behalf at any time (refresh_token)"

2. Add the Client ID and Client Secret to your `.env` file as shown above

3. Navigate to `/oauth/settings` in the application to configure and switch between authentication methods

4. Click "Authorize with Salesforce" to complete the OAuth flow

## API Endpoints

### Multi-Object Similarity Analysis (New!)
- GET /analyze-multi?objects=Account,Contact,Lead&threshold=0.8&method=nlp
  - Scan multiple Salesforce objects and present a comprehensive report organized by object
  - Shows all attributes and picklist values that cross the similarity threshold
  - Parameters:
    - objects: Comma-separated list of Salesforce object API names (required, e.g., Account,Contact,Lead)
    - threshold: Similarity threshold (0-1, optional, defaults based on method)
    - method: Analysis method - 'nlp' or 'wink' (optional, default: 'nlp')
  - Features:
    - Summary table showing total similarities found per object
    - Detailed analysis for each object with field and picklist similarities
    - Color-coded status indicators (green = clean, red = similarities found)
    - Yellow highlighting for similarities ≥95% (likely near-duplicates requiring immediate attention)
    - Easy navigation with table of contents and anchor links

### Single Object Similarity Analysis
- GET /analyze-nlp/:sobject?threshold=0.8
  - Analyze field similarities for a single object using combined NLP approach (Jaro-Winkler + string similarity)
  - Parameters:
    - sobject: The Salesforce object API name (e.g., Account, Contact)
    - threshold: Similarity threshold (0-1, default: 0.8)

- GET /analyze-nlp-wink/:sobject?threshold=0.7
  - Analyze field similarities for a single object using Wink NLP's token-based analysis
  - Parameters:
    - sobject: The Salesforce object API name (e.g., Account, Contact)
    - threshold: Similarity threshold (0-1, default: 0.7)

### Sharing Model Analysis
- GET /sharing/:sobject
  - Get detailed sharing model information for a Salesforce object
  - Parameters:
    - sobject: The Salesforce object API name (e.g., Account, Contact)
  - Returns: The object's sharing model settings with explanation

### Authentication Management
- GET /oauth/settings
  - View and manage authentication settings
- GET /oauth/authorize
  - Initiate the OAuth 2.0 authorization flow with Salesforce
- POST /oauth/set-mode
  - Switch between authentication modes (password or oauth)

### Understanding Thresholds
The threshold parameter controls how similar fields need to be to be included in the results:
- A higher threshold (e.g., 0.8) means fields need to be more similar to be flagged (stricter, fewer results)
- A lower threshold (e.g., 0.6) will catch more potential duplicates but may have false positives (more lenient, more results)
- Recommended: 0.8 for NLP method, 0.7 for Wink NLP method

### Visual Indicators
Reports include visual highlighting to help you quickly identify critical issues:
- **Yellow background (≥95% similarity)**: Near-duplicates that likely require immediate attention - these are extremely similar fields or picklist values that may be unintentional duplicates
- **Warning icon (⚠️)**: Appears alongside high similarity scores (≥95%) to draw attention to outliers
- **Green checkmarks (✓)**: Objects with no similarities found above threshold
- **Red warnings (⚠️)**: Objects with similarities that need review

## License

MIT
