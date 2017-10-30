'use strict';
const logger = require('winston');
const Pattern = require('../../utils/patterns');
const MapElement = require('../../models/mapElementModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: text, tokens
 * Out: elements
 */
module.exports = (ctx, next) => {
    const { text, tokens } = ctx;
    if (!text || !tokens) {
        logger.error('#findRouteName module should be used after "text", "tokens" property in ctx');
        return next();
    }
    
    if (tokens.length !== 1) {
        return next();
    }

    const pattern = Pattern.routeNameInText();
    const token = tokens[0];
    const match = token.content && token.content.match(pattern);
    if (!match) {
        return next();
    }
    const element = new MapElement('routeName', match[0]);
    element.source = scriptName;
    ctx.elements.push(element);
    return next();
};