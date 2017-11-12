'use strict';
const logger = require('winston');
const path = require('path');
const latinize = require('../../../utils/nlg').latinize;
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
const ed = require('edit-distance').levenshtein;

const insert = () => 1;
const remove = insert;
const update = (a, b) => a !== b ? 1 : 0;
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
    const distance = ed(latinize(text), latinize(matchText), insert, remove, update).distance;
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