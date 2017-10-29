'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const MapElement = require('../../models/mapElementModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: text
 * Out: elements
 */
module.exports = (ctx, next) => {
    const { text } = ctx;
    if (!text) {
        logger.error('#findLocation module should be used after "text" property in ctx');
        return next();
    }
    
    return Location.searchLocation(text)
        .then(res => {
            const element = new MapElement('location', res);
            element.source = scriptName;

            ctx.elements = ctx.elements || [];
            ctx.elements.push(element);
            return next();
        })
        .catch(() => next());
};