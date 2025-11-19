const salesforceService = require('../services/salesforce.service');
const similarityService = require('../services/similarity.service');
const { generateSimilarityAnalysisHtml, generateSharingModelHtml, generateHtmlResponse } = require('../utils/template.utils');

class AnalysisController {
  async analyzeSimilarity(req, res) {
    try {
      const sobjectName = req.params.sobject;
      const meta = await salesforceService.describeSObject(sobjectName);
      const threshold = typeof req.query.threshold === 'string' ? parseFloat(req.query.threshold) : 0.8;
      
      const results = await similarityService.analyzeSimilarities(meta, threshold);
      const html = generateSimilarityAnalysisHtml(sobjectName, results, 'NLP');
      res.send(html);
    } catch (err) {
      const errorContent = `<h1>Error</h1><pre>${err.message}</pre>`;
      res.status(500).send(generateHtmlResponse('Error', errorContent));
    }
  }

  async analyzeWinkSimilarity(req, res) {
    try {
      const sobjectName = req.params.sobject;
      const meta = await salesforceService.describeSObject(sobjectName);
      const threshold = typeof req.query.threshold === 'string' ? parseFloat(req.query.threshold) : 0.8;
      
      const results = await similarityService.analyzeWinkSimilarities(meta, threshold);
      const html = generateSimilarityAnalysisHtml(sobjectName, results, 'Wink NLP');
      res.send(html);
    } catch (err) {
      const errorContent = `<h1>Error</h1><pre>${err.message}</pre>`;
      res.status(500).send(generateHtmlResponse('Error', errorContent));
    }
  }

  async analyzeSharingModel(req, res) {
    try {
      const sobjectName = req.params.sobject;
      console.log('Analyzing sharing model for object:', sobjectName);
      
      // Get basic object info
      const meta = await salesforceService.describeSObject(sobjectName);
      
      // Get sharing model using metadata API
      const sharingInfo = await salesforceService.getSharingModel(sobjectName);
      
      // Get explanation, including special handling for objects that don't support sharing
      const explanation = sharingInfo.sharingModel === 'Unknown' 
        ? 'This object may not support sharing settings or you may not have permission to view them.'
        : salesforceService.explainSharingModel(sharingInfo.sharingModel);
        
      const html = generateSharingModelHtml(sobjectName, sharingInfo.sharingModel, explanation);
      res.send(html);
    } catch (err) {
      const errorContent = `<h1>Error</h1><pre>${err.message}</pre>`;
      res.status(500).send(generateHtmlResponse('Error', errorContent));
    }
  }

  async analyzeMultipleObjects(req, res) {
    try {
      const { objects, threshold, method } = req.query;
      
      if (!objects) {
        const errorContent = `<h1>Error</h1><p>Please provide 'objects' query parameter with comma-separated object names (e.g., ?objects=Account,Contact,Lead)</p>`;
        return res.status(400).send(generateHtmlResponse('Error', errorContent));
      }

      const objectList = objects.split(',').map(o => o.trim()).filter(Boolean);
      const parsedThreshold = typeof threshold === 'string' ? parseFloat(threshold) : (method === 'wink' ? 0.7 : 0.8);
      const analysisMethod = method === 'wink' ? 'wink' : 'nlp';

      console.log(`Analyzing ${objectList.length} objects:`, objectList);

      const results = [];
      for (const sobjectName of objectList) {
        try {
          console.log(`Processing ${sobjectName}...`);
          const meta = await salesforceService.describeSObject(sobjectName);
          
          const objectResults = analysisMethod === 'wink' 
            ? await similarityService.analyzeWinkSimilarities(meta, parsedThreshold)
            : await similarityService.analyzeSimilarities(meta, parsedThreshold);

          const totalSimilarities = objectResults.fields.length + 
            objectResults.picklists.reduce((sum, p) => sum + p.similarValues.length, 0);

          results.push({
            objectName: sobjectName,
            objectLabel: meta.label,
            results: objectResults,
            totalSimilarities
          });
        } catch (err) {
          console.error(`Error analyzing ${sobjectName}:`, err.message);
          results.push({
            objectName: sobjectName,
            objectLabel: sobjectName,
            error: err.message,
            totalSimilarities: 0
          });
        }
      }

      const { generateMultiObjectAnalysisHtml } = require('../utils/template.utils');
      const methodLabel = analysisMethod === 'wink' ? 'Wink NLP' : 'NLP';
      const html = generateMultiObjectAnalysisHtml(results, parsedThreshold, methodLabel);
      res.send(html);
    } catch (err) {
      const errorContent = `<h1>Error</h1><pre>${err.message}</pre>`;
      res.status(500).send(generateHtmlResponse('Error', errorContent));
    }
  }
}

module.exports = new AnalysisController();