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
      
      // First get basic object info
      const meta = await salesforceService.describeSObject(sobjectName);
      
      // Then get metadata including sharing model
      const objectMetadata = await salesforceService.getObjectMetadata(sobjectName);
      
      console.log('Object metadata received:', {
        objectName: meta.name,
        label: meta.label,
        sharingModel: objectMetadata.sharingModel,
        defaultRecordAccess: objectMetadata.defaultRecordAccess
      });
      
      // Get explanation
      const explanation = objectMetadata.sharingModel === 'Unknown'
        ? 'Unable to retrieve sharing settings. This may be because: \n' +
          '1. This is a standard object that does not expose sharing via the Metadata API\n' +
          '2. You may not have permission to view sharing settings\n' +
          '3. The object may not support sharing settings'
        : salesforceService.explainSharingModel(objectMetadata.sharingModel);
        
      const html = generateSharingModelHtml(sobjectName, objectMetadata.sharingModel, explanation);
      res.send(html);
    } catch (err) {
      res.status(500).send(`<html><body><h1>Error</h1><pre>${err.message}</pre></body></html>`);
    }
  }
}

module.exports = new AnalysisController();
