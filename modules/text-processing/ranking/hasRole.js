'use strict';
const logger = require('winston');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: node
 * Out: node
 */
module.exports = (ctx, next) => {
    const { node, weights } = ctx;
    if (!node || !weights) {
        logger.error('#hasRole module should be used after "node", "weights" property in ctx');
        return next();
    }

    if (!node.role) {
        return next();
    }

    const rankElement = {
        value: weights.role[node.role.type],
        source: scriptName
    };
    node.ranks.push(rankElement);
    //console.log('hasRole', rankElement);
    return next();
};