'use strict';
const logger = require('winston');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: element
 * Out: element
 */
module.exports = (ctx, next) => {
    const { element, weights } = ctx;
    if (!element || !weights) {
        logger.error('#typeBasedRank module should be used after "element" and "weights" property in ctx');
        return next();
    }

    const { type, partial } = element;
    let value = weights.type[type];
    if (partial) {
        value /= 2;
    }
    
    const rankElement = {
        value,
        source: scriptName
    };
    element.ranks.push(rankElement);
    
    return next();
};