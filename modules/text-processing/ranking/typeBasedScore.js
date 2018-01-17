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
        logger.error('#typeBasedScore module should be used after "element" and "weights" property in ctx');
        return next();
    }

    const { type, partial } = element;
    let value = weights.type[type];
    if (partial) {
        value = 0;
    }
    
    const scoreElement = {
        value,
        source: scriptName
    };
    element.scores.push(scoreElement);
    
    return next();
};