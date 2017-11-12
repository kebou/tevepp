'use strict';
const logger = require('winston');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: tokens, element
 * Out: element
 */
module.exports = (ctx, next) => {
    const { tokens, element, weights } = ctx;
    if (!tokens || !element || !weights) {
        logger.error('#relativeLength module should be used after "tokens", "weights" and "element" property in ctx');
        return next();
    }
    
    const matchText = element.value.name || element.value.title || element.value;
    
    const weight = weights.relativeLength;
    const tokenLength = tokens.length;
    const matchLength = matchText.split(' ').length;
    const lengthDiff = Math.abs(tokenLength - matchLength);
    const maxLength = Math.max(tokenLength, matchLength);
    const normalized = lengthDiff/maxLength;
    const value = (1 - normalized) * weight;

    const rankElement = {
        value,
        source: scriptName
    };
    element.ranks.push(rankElement);

    return next();
};