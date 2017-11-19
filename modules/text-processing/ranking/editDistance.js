'use strict';
const logger = require('winston');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
const ed = require('fast-levenshtein');

/**
 * In: text, element
 * Out: element
 */
module.exports = (ctx, next) => {
    const { text, element, weights } = ctx;
    if (!text || !element || !weights) {
        logger.error('#editDistance module should be used after "text", "weights" and "element" property in ctx');
        return next();
    }

    const matchText = element.value.name || element.value.title || element.value;
    
    const weight = weights.editDistance;
    const distance = ed.get(text, matchText, { useCollator: true });
    const max = Math.max(text.length, matchText.length);
    const normalized = distance/max;
    const value = (1 - normalized) * weight;

    const rankElement = {
        value,
        source: scriptName
    };
    element.ranks.push(rankElement);

    return next();
};