'use strict';
const logger = require('winston');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: node
 * Out: node
 */
module.exports = (ctx, next) => {
    const { node, weights, allTokens } = ctx;
    if (!node, !weights) {
        logger.error('#absoluteLength module should be used after "node" and "weights" property in ctx');
        return next();
    }

    const weight = weights.absoluteLength;
    let length = node.tokens.length;
    if (length > allTokens.length / 2) length = allTokens.length / 2;
    //const value = Math.pow(allTokens.length*allTokens.length/(2*length), length);
    const value = Math.pow(weight, length);
    // if (length > allTokens.length/2) {
    //     length = allTokens.length/2;
    // }
    //const value = length * weight;
    //const value = logN(length+1, length);

    // const tau = 5;
    // const offset = 100;
    // const weight = 100;
    // const value = offset + weight*(1 - Math.exp(-length/tau));
    
    const rankElement = {
        value,
        source: scriptName
    };
    node.ranks.push(rankElement);
    //console.log('absoluteLength', rankElement);
    return next();
};

const logN = (base, value) => {
    return Math.log(value) / Math.log(base);
};