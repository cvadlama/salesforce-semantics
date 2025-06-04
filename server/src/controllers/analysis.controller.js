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
}

module.exports = new AnalysisController();