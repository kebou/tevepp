'use strict';
const logger = require('winston');
const Pattern = require('../../utils/patterns');
const MapElement = require('../../models/mapElementModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: text, node
 * Out: elements
 */
module.exports = (ctx, next) => {
    const { text, node } = ctx;
    if (!text || !node) {
        logger.error('#findRouteName module should be used after "text" and "node" property in ctx');
        return next();
    }

    if (node.tokens.length !== 1) {
        return next();
    }

    const pattern = Pattern.routeNameInText();
    const token = node.tokens[0];
    const match = token.content && token.content.match(pattern);
    if (!match) {
        return next();
    }
    const element = new MapElement('routeName', match[0]);
    element.source = scriptName;

    node.elements = node.elements || [];
    node.elements.push(element);
    return next();
};