'use strict';
const logger = require('winston');
const MapElement = require('../../models/mapElementModel');
const latinize = require('../../utils/nlg').latinize;
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: tokens
 * Out: role
 */
module.exports = (ctx, next) => {
    const { node } = ctx;
    if (!node) {
        logger.error('#findRoleRegexp module should be used after "node" property in ctx');
        return next();
    }

    if (ctx.role) {
        return next();
    }
    
    const token = node.tokens[node.tokens.length -1];
    const latinizedToken = latinize(token.content);

    const startToken = isStartToken(latinizedToken);
    const endToken = isEndToken(latinizedToken);

    if (!startToken && !endToken) {
        return next();
    }

    let value;
    if (startToken) {
        value = 'start';
        token.custom = startToken[0];
    }
    if (endToken) {
        value = 'end';
        token.custom = endToken[0];
    }

    const element = new MapElement('regexp', value);
    element.source = scriptName;
    node.role = element;
    // szöveg frissítése a ragok nélküli verzióval
    ctx.text = node.text;

    return next();
};

const isStartToken = (str) => {
    const pattern = /[^-]*(?=-?bol$)|[^-]*(?=-?rol$)|[^-]*(?=-?tol$)/i;
    return str.match(pattern);
};

const isEndToken = (str) => {
    const pattern = /[^-]*(?=-?hoz$)|[^-]*(?=-?ig$)|[^-]*(?=-?ra$)|[^-]*(?=-?re$)|[^-]*(?=-?ba$)|[^-]*(?=-?be$)/i;
    return str.match(pattern);
};