# Salesforce Field Similarity Analyzer

A Node.js application that analyzes Salesforce object fields and picklists for semantic similarities using different NLP approaches.

## Features

- Analyze field label similarities using combined NLP approach (Jaro-Winkler + string similarity)
- Analyze field label similarities using Wink NLP's token-based analysis
- Analyze picklist value similarities
- View sharing model information for Salesforce objects

## Setup

1. Clone the repository
2. Run \`npm install\`
3. Create a \`.env\` file with your Salesforce credentials:
   ```
   SF_USERNAME=your_username
   SF_PASSWORD=your_password
   PORT=3001
   ```
4. Run \`npm run dev\` for development or \`npm start\` for production

## API Endpoints

- GET /analyze-nlp/:sobject?threshold=0.8 - Analyze field similarities using combined NLP (threshold: 0-1, default: 0.8)
- GET /analyze-nlp-wink/:sobject?threshold=0.7 - Analyze field similarities using Wink NLP (threshold: 0-1, default: 0.7)
- GET /sharing/:sobject - Get sharing model information

The threshold parameter controls how similar fields need to be to be included in the results. A higher threshold means fields need to be more similar to be included (0.8 is stricter than 0.7).

## License

MIT
