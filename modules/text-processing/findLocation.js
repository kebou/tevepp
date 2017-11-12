'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const MapElement = require('../../models/mapElementModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: text, node
 * Out: elements
 */
module.exports = (ctx, next) => {
    const { text, node, skipLocation } = ctx;
    if (!text || !node) {
        logger.error('#findLocation module should be used after "text" and "node" property in ctx');
        return next();
    }

    if (skipLocation) {
        return next();
    }
    
    return Location.searchLocation(node.text, { minConfidence: 0 })
        .then(res => {
            if (res.title === '' || res.title.startsWith(',')) {
                return next();
            }
            
            const element = new MapElement('location', res);
            element.source = scriptName;

            node.elements = node.elements || [];
            node.elements.push(element);
            return next();
        })
        .catch(() => next());
};