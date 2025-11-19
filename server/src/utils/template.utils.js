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
  
  // Add legend for highlighting
  content += `<div style="background: #fff59d; padding: 12px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f9a825;">
    <strong>⚠️ High Similarity Alert:</strong> Rows highlighted in yellow indicate similarities ≥95%, which are likely near-duplicates requiring immediate attention.
  </div>`;

  // Field Labels section
  content += '<h2>Similar Field Labels</h2>';
  if (fields.length === 0) {
    content += '<p>No similar field labels found.</p>';
  } else {
    content += '<table><tr><th>Label 1</th><th>Label 2</th><th>Similarity</th></tr>';
    for (const { pair, jaroWinkler, cosine, apiNames } of fields) {
      const similarity = Math.round((cosine || 0) * 100);
      const highlightStyle = similarity >= 95 ? ' style="background-color: #fff59d; font-weight: bold;"' : '';
      const highlightIndicator = similarity >= 95 ? ' ⚠️' : '';
      content += `<tr${highlightStyle}>
        <td><div><b>${pair[0]}</b></div><div class="api-name">${apiNames[0]}</div></td>
        <td><div><b>${pair[1]}</b></div><div class="api-name">${apiNames[1]}</div></td>
        <td><strong>${similarity}%${highlightIndicator}</strong></td>
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
        
        const highlightStyle = similarity >= 95 ? ' style="background-color: #fff59d; font-weight: bold;"' : '';
        const highlightIndicator = similarity >= 95 ? ' ⚠️' : '';
        
        content += `<tr${highlightStyle}>
          <td><b>${pair[0]}</b> ${value1Status}<br><span class="api-name">${apiValues[0]}</span></td>
          <td><b>${pair[1]}</b> ${value2Status}<br><span class="api-name">${apiValues[1]}</span></td>
          <td><strong>${similarity}%${highlightIndicator}</strong></td>
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

const generateMultiObjectAnalysisHtml = (objectsData, threshold, method = 'NLP') => {
  let content = `
    <h1>Multi-Object ${method} Similarity Analysis</h1>
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <p><strong>Analysis Summary:</strong></p>
      <ul style="margin: 5px 0;">
        <li>Objects Analyzed: ${objectsData.length}</li>
        <li>Similarity Threshold: ${Math.round(threshold * 100)}%</li>
        <li>Analysis Method: ${method}</li>
      </ul>
    </div>
    
    <div style="background: #fff59d; padding: 12px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f9a825;">
      <strong>⚠️ High Similarity Alert:</strong> Rows highlighted in yellow indicate similarities ≥95%, which are likely near-duplicates requiring immediate attention.
    </div>
  `;

  // Table of contents with summary
  content += '<h2>Table of Contents</h2>';
  content += '<table style="width: 100%;"><tr><th>Object</th><th>Total Similarities Found</th><th>Field Similarities</th><th>Picklist Similarities</th><th>Status</th></tr>';
  
  for (const objData of objectsData) {
    if (objData.error) {
      content += `<tr>
        <td><a href="#${objData.objectName}">${objData.objectLabel} (<code>${objData.objectName}</code>)</a></td>
        <td colspan="3" style="color: #e74c3c;">Error</td>
        <td style="color: #e74c3c;">Failed</td>
      </tr>`;
    } else {
      const fieldCount = objData.results.fields.length;
      const picklistCount = objData.results.picklists.reduce((sum, p) => sum + p.similarValues.length, 0);
      const totalCount = fieldCount + picklistCount;
      const statusColor = totalCount > 0 ? '#e74c3c' : '#27ae60';
      const statusText = totalCount > 0 ? `⚠️ ${totalCount} found` : '✓ Clean';
      
      content += `<tr>
        <td><a href="#${objData.objectName}">${objData.objectLabel} (<code>${objData.objectName}</code>)</a></td>
        <td style="text-align: center; font-weight: bold; color: ${statusColor};">${totalCount}</td>
        <td style="text-align: center;">${fieldCount}</td>
        <td style="text-align: center;">${picklistCount}</td>
        <td style="color: ${statusColor};">${statusText}</td>
      </tr>`;
    }
  }
  content += '</table>';

  // Detailed results for each object
  content += '<h2>Detailed Analysis by Object</h2>';
  
  for (const objData of objectsData) {
    content += `<div id="${objData.objectName}" style="border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; background: #ffffff;">`;
    content += `<h2 style="margin-top: 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
      ${objData.objectLabel} (<code>${objData.objectName}</code>)
    </h2>`;

    if (objData.error) {
      content += `<div style="background: #fee; border-left: 4px solid #e74c3c; padding: 15px; margin: 10px 0;">
        <strong>Error:</strong> ${objData.error}
      </div>`;
    } else {
      const { fields, picklists } = objData.results;
      
      // Summary for this object
      const totalCount = fields.length + picklists.reduce((sum, p) => sum + p.similarValues.length, 0);
      if (totalCount === 0) {
        content += '<div style="background: #d4edda; border-left: 4px solid #27ae60; padding: 15px; margin: 10px 0; color: #155724;">';
        content += '<strong>✓ No similarities found above threshold</strong>';
        content += '</div>';
      } else {
        content += '<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; color: #856404;">';
        content += `<strong>⚠️ Found ${totalCount} potential duplicate${totalCount > 1 ? 's' : ''}</strong> (${fields.length} field${fields.length !== 1 ? 's' : ''}, ${picklists.reduce((sum, p) => sum + p.similarValues.length, 0)} picklist value${picklists.reduce((sum, p) => sum + p.similarValues.length, 0) !== 1 ? 's' : ''})`;
        content += '</div>';
      }

      // Field Labels section
      if (fields.length > 0) {
        content += '<h3 style="color: #e74c3c;">⚠️ Similar Field Labels</h3>';
        content += '<table style="width: 100%;"><tr><th>Label 1</th><th>Label 2</th><th>Similarity</th></tr>';
        for (const { pair, jaroWinkler, cosine, apiNames } of fields) {
          const similarity = Math.round((cosine || 0) * 100);
          const highlightStyle = similarity >= 95 ? ' style="background-color: #fff59d; font-weight: bold;"' : '';
          const highlightIndicator = similarity >= 95 ? ' ⚠️' : '';
          content += `<tr${highlightStyle}>
            <td><div><b>${pair[0]}</b></div><div class="api-name">${apiNames[0]}</div></td>
            <td><div><b>${pair[1]}</b></div><div class="api-name">${apiNames[1]}</div></td>
            <td style="font-weight: bold;">${similarity}%${highlightIndicator}</td>
          </tr>`;
        }
        content += '</table>';
      } else {
        content += '<h3 style="color: #27ae60;">✓ Similar Field Labels</h3>';
        content += '<p style="color: #27ae60;">No similar field labels found above threshold.</p>';
      }

      // Picklist Values section
      if (picklists.length > 0) {
        content += '<h3 style="color: #e74c3c;">⚠️ Similar Picklist Values</h3>';
        for (const pick of picklists) {
          content += `<h4 style="margin-top: 20px;">${pick.label} (<code>${pick.field}</code>) ${pick.active === false ? '<span class="inactive">Inactive</span>' : ''}</h4>`;
          content += '<table style="width: 100%;"><tr><th>Value 1</th><th>Value 2</th><th>Similarity</th></tr>';
          for (const { pair, jaroWinkler, cosine, apiValues, active } of pick.similarValues) {
            const similarity = cosine ? 
              Math.round(cosine * 100) :
              Math.round((jaroWinkler + cosine) / 2 * 100);
            
            const value1Status = active[0] === false ? '<span class="inactive">(Inactive)</span>' : '<span class="active">(Active)</span>';
            const value2Status = active[1] === false ? '<span class="inactive">(Inactive)</span>' : '<span class="active">(Active)</span>';
            
            const highlightStyle = similarity >= 95 ? ' style="background-color: #fff59d; font-weight: bold;"' : '';
            const highlightIndicator = similarity >= 95 ? ' ⚠️' : '';
            
            content += `<tr${highlightStyle}>
              <td><b>${pair[0]}</b> ${value1Status}<br><span class="api-name">${apiValues[0]}</span></td>
              <td><b>${pair[1]}</b> ${value2Status}<br><span class="api-name">${apiValues[1]}</span></td>
              <td style="font-weight: bold;">${similarity}%${highlightIndicator}</td>
            </tr>`;
          }
          content += '</table>';
        }
      } else {
        content += '<h3 style="color: #27ae60;">✓ Similar Picklist Values</h3>';
        content += '<p style="color: #27ae60;">No similar picklist values found above threshold.</p>';
      }
    }
    
    content += '</div>'; // Close object container
  }

  // Add back-to-top link
  content += '<div style="text-align: center; margin: 30px 0;"><a href="#" style="color: #3498db; text-decoration: none; font-weight: bold;">↑ Back to Top</a></div>';

  return generateHtmlResponse('Multi-Object Similarity Analysis', content);
};

module.exports = {
  generateHtmlResponse,
  generateSimilarityAnalysisHtml,
  generateSharingModelHtml,
  generateMultiObjectAnalysisHtml
};
