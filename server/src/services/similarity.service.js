const { analyzeLabelSimilarities, analyzeLabelSimilaritiesWink } = require('./OrgSemantic');

class SimilarityService {
  async analyzeSimilarities(meta, threshold = 0.8) {
    // Field labels with API names
    const fieldLabelsWithApi = meta.fields.map(f => ({
      label: f.label,
      api: f.name
    }));
    const fieldLabels = fieldLabelsWithApi.map(f => f.label);
    
    // Find similar field labels using NLP
    const similarLabelsNLP = analyzeLabelSimilarities(fieldLabels, threshold);

    // Map the similar labels back to their API names
    const enhancedSimilarLabelsNLP = similarLabelsNLP.map(sim => {
      const apiName1 = fieldLabelsWithApi.find(f => f.label === sim.pair[0])?.api;
      const apiName2 = fieldLabelsWithApi.find(f => f.label === sim.pair[1])?.api;
      
      // Only include pairs with different API names
      if (apiName1 && apiName2 && apiName1 !== apiName2) {
        return {
          pair: sim.pair,
          cosine: sim.cosine || sim.similarity,
          jaroWinkler: sim.jaroWinkler || sim.similarity,
          apiNames: [apiName1, apiName2]
        };
      }
      return null;
    }).filter(Boolean);

    // Analyze picklists
    const picklists = meta.fields.filter(f => f.type === 'picklist');
    const picklistValues = picklists.map(f => {
      const picklistValuesWithApi = f.picklistValues.map(v => ({
        label: v.label,
        value: v.value
      }));
      return {
        field: f.name,
        label: f.label,
        values: picklistValuesWithApi
      };
    });

    // Find similar picklist values using NLP
    const similarPicklistsNLP = [];
    for (const picklist of picklistValues) {
      const labels = picklist.values.map(v => v.label);
      const similar = analyzeLabelSimilarities(labels, threshold);
      
      const enhancedSimilar = similar.map(sim => ({
        pair: sim.pair,
        cosine: sim.cosine || sim.similarity,
        jaroWinkler: sim.jaroWinkler || sim.similarity,
        apiValues: [
          picklist.values.find(v => v.label === sim.pair[0])?.value || '',
          picklist.values.find(v => v.label === sim.pair[1])?.value || ''
        ]
      }));

      if (enhancedSimilar.length > 0) {
        similarPicklistsNLP.push({
          field: picklist.field,
          label: picklist.label,
          similarValues: enhancedSimilar
        });
      }
    }

    return {
      fields: enhancedSimilarLabelsNLP,
      picklists: similarPicklistsNLP
    };
  }

  async analyzeWinkSimilarities(meta, threshold = 0.7) { // Lower threshold for wink analysis
    // Field labels with API names
    const fieldLabelsWithApi = meta.fields.map(f => ({
      label: f.label,
      api: f.name
    }));
    const fieldLabels = fieldLabelsWithApi.map(f => f.label);
    
    // Find similar field labels using wink-nlp
    const similarLabelsWink = analyzeLabelSimilaritiesWink(fieldLabels, threshold);

    // Map the similar labels back to their API names and convert similarity to cosine
    const enhancedSimilarLabelsWink = similarLabelsWink
      .map(sim => {
        const apiName1 = fieldLabelsWithApi.find(f => f.label === sim.pair[0])?.api;
        const apiName2 = fieldLabelsWithApi.find(f => f.label === sim.pair[1])?.api;
        
        // Only include pairs with different API names
        if (apiName1 && apiName2 && apiName1 !== apiName2) {
          return {
            pair: sim.pair,
            cosine: sim.similarity, // Map similarity to cosine for template compatibility
            apiNames: [apiName1, apiName2]
          };
        }
        return null;
      })
      .filter(Boolean);

    // Analyze picklists with the same threshold
    const picklists = meta.fields.filter(f => f.type === 'picklist');

    const picklistValues = picklists.map(f => {
      const picklistValuesWithApi = f.picklistValues.map(v => ({
        label: v.label,
        value: v.value
      }));
      return {
        field: f.name,
        label: f.label,
        values: picklistValuesWithApi
      };
    });

    // Find similar picklist values using wink-nlp
    const similarPicklistsWink = [];
    for (const picklist of picklistValues) {
      const labels = picklist.values.map(v => v.label);
      const similar = analyzeLabelSimilaritiesWink(labels, threshold);
      
      const enhancedSimilar = similar
        .map(sim => {
          const apiValue1 = picklist.values.find(v => v.label === sim.pair[0])?.value;
          const apiValue2 = picklist.values.find(v => v.label === sim.pair[1])?.value;
          
          if (apiValue1 && apiValue2 && apiValue1 !== apiValue2) {
            return {
              pair: sim.pair,
              cosine: sim.similarity, // Map similarity to cosine for template compatibility
              apiValues: [apiValue1, apiValue2]
            };
          }
          return null;
        })
        .filter(Boolean);

      if (enhancedSimilar.length > 0) {
        similarPicklistsWink.push({
          field: picklist.field,
          label: picklist.label,
          similarValues: enhancedSimilar
        });
      }
    }

    return {
      fields: enhancedSimilarLabelsWink,
      picklists: similarPicklistsWink
    };
  }
}

module.exports = new SimilarityService();
