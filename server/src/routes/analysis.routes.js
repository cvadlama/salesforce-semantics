const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');

// Analyze multiple SObjects for similarities
router.get('/analyze-multi', analysisController.analyzeMultipleObjects);

// Analyze SObject fields for NLP-based similarity
router.get('/analyze-nlp/:sobject', analysisController.analyzeSimilarity);

// Analyze SObject fields for wink-nlp-based similarity
router.get('/analyze-nlp-wink/:sobject', analysisController.analyzeWinkSimilarity);

// Analyze sharing settings for a given SObject
router.get('/sharing/:sobject', analysisController.analyzeSharingModel);

module.exports = router;
