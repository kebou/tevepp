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
    const { tokens } = ctx;
    if (!tokens) {
        logger.error('#findRoleRegexp module should be used after "tokens" property in ctx');
        return next();
    }

    if (ctx.role) {
        return next();
    }
    
    const token = tokens[tokens.length -1];
    const latinizedToken = latinize(token.content);

    const startToken = isStartToken(latinizedToken);
    const endToken = isEndToken(latinizedToken);

    if (!startToken && ! endToken) {
        return next();
    }

    let value;
    if (startToken) {
        value = 'start';
    }
    if (endToken) {
        value = 'end';
    }
    token.custom = latinizedToken;

    const element = new MapElement('regexp', value);
    element.source = scriptName;
    ctx.role = element;

    return next();
};

const isStartToken = (str) => {
    const pattern = /.*(?=bol$)|.*(?=rol$)|.*(?=tol$)/i;
    return str.match(pattern);
};

const isEndToken = (str) => {
    const pattern = /.*(?=hoz$)|.*(?=ig$)|.*(?=ra$)|.*(?=re$)|.*(?=ba$)|.*(?=be$)/i;
    return str.match(pattern);
};