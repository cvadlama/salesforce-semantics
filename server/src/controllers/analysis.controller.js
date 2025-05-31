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
      const meta = await salesforceService.describeSObject(sobjectName);
      const sharingModel = meta.sharingModel || 'Unknown';
      const explanation = salesforceService.explainSharingModel(sharingModel);
      const html = generateSharingModelHtml(sobjectName, sharingModel, explanation);
      res.send(html);
    } catch (err) {
      res.status(500).send(`<html><body><h1>Error</h1><pre>${err.message}</pre></body></html>`);
    }
  }
}

module.exports = new AnalysisController();
