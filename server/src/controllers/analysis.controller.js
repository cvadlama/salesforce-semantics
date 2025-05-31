const salesforceService = require('../services/salesforce.service');
const similarityService = require('../services/similarity.service');
const { generateSimilarityAnalysisHtml, generateSharingModelHtml } = require('../utils/template.utils');

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
      res.status(500).send(`<html><body><h1>Error</h1><pre>${err.message}</pre></body></html>`);
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
      res.status(500).send(`<html><body><h1>Error</h1><pre>${err.message}</pre></body></html>`);
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
      console.log('Sharing settings received from Salesforce:', {
        objectName: meta.name,
        label: meta.label,
        sharingModel: sharingInfo.sharingModel,
        defaultRecordAccess: sharingInfo.defaultRecordAccess
      });
      
      // Get explanation, including special handling for objects that don't support sharing
      const explanation = sharingInfo.sharingModel === 'Unknown' 
        ? 'This object may not support sharing settings or you may not have permission to view them.'
        : salesforceService.explainSharingModel(sharingInfo.sharingModel);
        
      const html = generateSharingModelHtml(sobjectName, sharingInfo.sharingModel, explanation);
      res.send(html);
    } catch (err) {
      res.status(500).send(`<html><body><h1>Error</h1><pre>${err.message}</pre></body></html>`);
    }
  }
}

module.exports = new AnalysisController();
