const generateHtmlResponse = (title, content) => {
  return `<html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: sans-serif; }
        h2 { color: #2c3e50; }
        table { border-collapse: collapse; margin-bottom: 20px; }
        td, th { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
        td div { margin: 2px 0; }
        .api-name { color: #666; font-size: 0.9em; }
      </style>
    </head>
    <body>
      ${content}
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
      content += `<h3>${pick.label} (<code>${pick.field}</code>)</h3>`;
      content += '<table><tr><th>Value 1</th><th>Value 2</th><th>Similarity</th></tr>';
      for (const { pair, jaroWinkler, cosine, apiValues } of pick.similarValues) {
        const similarity = cosine ? 
          Math.round(cosine * 100) :
          Math.round((jaroWinkler + cosine) / 2 * 100);
        content += `<tr>
          <td><b>${pair[0]}</b><br><span class="api-name">${apiValues[0]}</span></td>
          <td><b>${pair[1]}</b><br><span class="api-name">${apiValues[1]}</span></td>
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
