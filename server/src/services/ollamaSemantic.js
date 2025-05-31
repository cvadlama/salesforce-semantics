const natural = require('natural');
const stringSimilarity = require('string-similarity');
const winkNLP = require('wink-nlp');
const model = require('wink-eng-lite-web-model');
const nlp = winkNLP(model);

// Helper function to preprocess labels
function preprocessLabel(label) {
  return label
    .replace(/([A-Z])/g, ' $1') // Split camelCase
    .replace(/[_-]/g, ' ')      // Replace underscores and hyphens with spaces
    .toLowerCase()              // Convert to lowercase
    .trim();                    // Remove extra spaces
}

// Analyze label similarities using combined NLP approach
function analyzeLabelSimilarities(labels, threshold = 0.7) {
  const similarPairs = [];

  // Compare each pair of labels
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const label1 = preprocessLabel(labels[i]);
      const label2 = preprocessLabel(labels[j]);
      
      // Use Jaro-Winkler distance from 'natural'
      const jaroSim = natural.JaroWinklerDistance(label1, label2);
      // Use string similarity
      const stringSim = stringSimilarity.compareTwoStrings(label1, label2);
      
      // Calculate combined similarity score
      const similarity = (jaroSim + stringSim) / 2;
      
      if (similarity > threshold) {
        similarPairs.push({
          pair: [labels[i], labels[j]],
          similarity
        });
      }
    }
  }

  return similarPairs;
}

// Analyze label similarities using Wink NLP's more sophisticated NLP capabilities
function analyzeLabelSimilaritiesWink(labels, threshold = 0.7) {
  const similarPairs = [];
  
  // Process all labels with Wink NLP
  const docs = labels.map(label => nlp.readDoc(preprocessLabel(label)));
  
  // Compare each pair of labels using token-based and semantic similarity
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const doc1 = docs[i];
      const doc2 = docs[j];
      
      // Get tokens (excluding punctuation and special characters)
      const tokens1 = doc1.tokens().filter(t => t.out(its.type) === 'word').out();
      const tokens2 = doc2.tokens().filter(t => t.out(its.type) === 'word').out();
      
      // Calculate token overlap similarity
      const uniqueTokens1 = new Set(tokens1);
      const uniqueTokens2 = new Set(tokens2);
      const intersection = new Set([...uniqueTokens1].filter(x => uniqueTokens2.has(x)));
      const union = new Set([...uniqueTokens1, ...uniqueTokens2]);
      
      // Jaccard similarity for token overlap
      const similarity = intersection.size / union.size;
      
      if (similarity > threshold) {
        similarPairs.push({
          pair: [labels[i], labels[j]],
          similarity,
          method: 'wink-nlp'
        });
      }
    }
  }
  
  return similarPairs;
}

module.exports = { analyzeLabelSimilarities, analyzeLabelSimilaritiesWink };
