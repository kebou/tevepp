'use strict';
const logger = require('winston');
const Futar = require('../../controllers/futarController');
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
        logger.error('#findStop module should be used after "text" property in ctx');
        return next();
    }
    
    return Futar.searchStop(text)
        .then(res => {
            const element = new MapElement('stop', res[0]);
            element.source = scriptName;

            ctx.elements = ctx.elements || [];
            ctx.elements.push(element);
            return next();
        })
        .catch(() => next());
};