'use strict';
const logger = require('winston');
const MapElement = require('../../models/mapElementModel');
const latinize = require('../../utils/nlg').latinize;
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: text, user, node
 * Out: elements
 */
module.exports = (ctx, next) => {
    const { text, user, node } = ctx;
    if (!text || !user || !node) {
        logger.error('#findFavouriteLocation module should be used after "text", "user" and "node" property in ctx');
        return next();
    }

    user.locations && user.locations.forEach(location => {
        // csak azonos hosszú string
        if (location.name.split(' ').length !== text.split(' ').length) {
            return;
        }
        const pattern = new RegExp(latinize(location.name), 'i');
        const match = latinize(text).match(pattern);
        // csak ha string elejétől egyezik, index == 0
        if (match && match.length > 0 && match.index === 0) {
            const element = new MapElement('favourite', location);
            element.source = scriptName;

            node.elements = node.elements || [];
            node.elements.push(element);
        }
    });
    return next();
};