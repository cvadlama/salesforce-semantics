const { SF_USERNAME, SF_LOGIN_URL, AUTH_MODE, SF_OAUTH_INSTANCE_URL } = require('../config/database');

const generateHtmlResponse = (title, content) => {
  // Determine which instance URL to show based on auth mode
  const instanceUrl = AUTH_MODE === 'oauth' ? SF_OAUTH_INSTANCE_URL : SF_LOGIN_URL;
  const authMethod = AUTH_MODE === 'oauth' ? 'OAuth' : 'Username-Password';
  
  return `<html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: sans-serif; margin: 0; padding: 0; display: flex; flex-direction: column; min-height: 100vh; }
        h1 { margin-top: 20px; }
        h2 { color: #2c3e50; }
        table { border-collapse: collapse; margin-bottom: 20px; }
        td, th { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
        td div { margin: 2px 0; }
        .api-name { color: #666; font-size: 0.9em; }
        .inactive { color: #e74c3c; font-size: 0.9em; font-weight: normal; margin-left: 6px; }
        .active { color: #27ae60; font-size: 0.9em; font-weight: normal; margin-left: 6px; }
        .content { flex: 1; padding: 0 20px 20px 20px; }
        .header { background-color: #f8f9fa; padding: 10px 20px; border-bottom: 1px solid #e9ecef; font-size: 0.85em; color: #6c757d; }
        .header-info { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
        .auth-badge { 
          display: inline-block; 
          padding: 2px 6px; 
          border-radius: 3px; 
          background-color: ${AUTH_MODE === 'oauth' ? '#27ae60' : '#3498db'}; 
          color: white; 
          font-size: 0.8em; 
          margin-left: 5px; 
        }
        @media (max-width: 768px) {
          .header-info { flex-direction: column; align-items: flex-start; }
          .header-info p { margin: 3px 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-info">
          <p>Connected as: <strong>${SF_USERNAME || 'Unknown'}</strong> <span class="auth-badge">${authMethod}</span></p>
          <p>Salesforce Instance: <strong>${instanceUrl || 'Unknown'}</strong></p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
      <div class="content">
        ${content}
      </div>
    </body>
  </html>`;
};

const generateSimilarityAnalysisHtml = (sobjectName, similarityResults, type = 'NLP') => {
  const { fields, picklists } = similarityResults;
  let content = `<h1>${type} Similarity Analysis for <code>${sobjectName}</code></h1>`;

  // Field Labels section
  content += '<h2>Similar Field Labels</h2>';
  if (fields.length === 0) {
    content += '<p>No similar field labels found.</p>';
  } else {
    content += '<table><tr><th>Label 1</th><th>Label 2</th><th>Similarity</th></tr>';
    for (const { pair, jaroWinkler, cosine, apiNames } of fields) {
      const similarity = Math.round((cosine || 0) * 100);
      content += `<tr>
        <td><div><b>${pair[0]}</b></div><div class="api-name">${apiNames[0]}</div></td>
        <td><div><b>${pair[1]}</b></div><div class="api-name">${apiNames[1]}</div></td>
        <td>${similarity}%</td>
      </tr>`;
    }
    content += '</table>';
  }

  // Picklist Values section
  content += '<h2>Similar Picklist Values</h2>';
  if (picklists.length === 0) {
    content += '<p>No similar picklist values found.</p>';
  } else {
    for (const pick of picklists) {
      content += `<h3>${pick.label} (<code>${pick.field}</code>) ${pick.active === false ? '<span class="inactive">Inactive</span>' : ''}</h3>`;
      content += '<table><tr><th>Value 1</th><th>Value 2</th><th>Similarity</th></tr>';
      for (const { pair, jaroWinkler, cosine, apiValues, active } of pick.similarValues) {
        const similarity = cosine ? 
          Math.round(cosine * 100) :
          Math.round((jaroWinkler + cosine) / 2 * 100);
        
        // Include active/inactive status in the same cell as the picklist value
        const value1Status = active[0] === false ? '<span class="inactive">(Inactive)</span>' : '<span class="active">(Active)</span>';
        const value2Status = active[1] === false ? '<span class="inactive">(Inactive)</span>' : '<span class="active">(Active)</span>';
        
        content += `<tr>
          <td><b>${pair[0]}</b> ${value1Status}<br><span class="api-name">${apiValues[0]}</span></td>
          <td><b>${pair[1]}</b> ${value2Status}<br><span class="api-name">${apiValues[1]}</span></td>
          <td>${similarity}%</td>
        </tr>`;
      }
      content += '</table>';
    }
  }

  return generateHtmlResponse(`${type} Similarity for ${sobjectName}`, content);
};

const generateSharingModelHtml = (sobjectName, sharingModel, explanation) => {
  const content = `
    <h1>Sharing Model for <code>${sobjectName}</code></h1>
    <p><b>Sharing Model:</b> <code>${sharingModel}</code></p>
    <p><b>Explanation:</b> ${explanation}</p>
  `;
  return generateHtmlResponse(`Sharing Model for ${sobjectName}`, content);
};

module.exports = {
  generateHtmlResponse,
  generateSimilarityAnalysisHtml,
  generateSharingModelHtml
};
