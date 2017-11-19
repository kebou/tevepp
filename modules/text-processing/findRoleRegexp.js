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

    if (node.role) {
        return next();
    }
    
    const lastIdx = node.tokens.length - 1;
    const token = node.tokens[lastIdx];
    const latinizedToken = latinize(token.content);

    const startToken = isStartToken(latinizedToken);
    const endToken = isEndToken(latinizedToken);

    if (!startToken && !endToken) {
        return next();
    }

    let value, match;
    if (startToken) {
        value = 'start';
        match = startToken[0];
    }
    if (endToken) {
        value = 'end';
        match = endToken[0];
    }

    // utolsó hang rövídítése ha az mássalhangzó
    const diff = Math.abs(token.content.length - match.length);
    const custom = token.content.slice(0,token.content.length-diff-1) + match.slice(-1);

    node.tokens = node.tokens.slice(0);
    node.tokens[lastIdx] = Object.assign({}, node.tokens[lastIdx]);
    node.tokens[lastIdx].custom = custom;

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