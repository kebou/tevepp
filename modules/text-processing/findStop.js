'use strict';
const logger = require('winston');
const Futar = require('../../controllers/futarController');
const Location = require('../../controllers/locationController');
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
        logger.error('#findStop module should be used after "text" and "node" property in ctx');
        return next();
    }
    
    return Futar.searchStop(text)
        .then(stops => Location.fromStop(stops[0]))
        .then(location => {
            const element = new MapElement('stop', location);
            element.source = scriptName;

            node.elements = node.elements || [];
            node.elements.push(element);
            return next();
        })
        .catch(() => next());
};