'use strict';
const logger = require('winston');
const Futar = require('../../controllers/futarController');
const Location = require('../../controllers/locationController');
const MapElement = require('../../models/mapElementModel');
const latinize = require('../../utils/nlg').latinize;
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

    if (shouldSkip(node)) {
        return next();
    }
    
    return Futar.searchStop(text)
        .then(stops => Location.fromStop(stops[0]))
        .then(location => {
            if (!haveSameStart(text, location)) {
                return next();
            }
            const element = new MapElement('stop', location);
            element.source = scriptName;

            node.elements = node.elements || [];
            node.elements.push(element);
            return next();
        })
        .catch(() => next());
};

const shouldSkip = (node) => {
    const firstToken = node.tokens[0];
    return startsWith(firstToken);
};

const startsWith = (token) => {
    const str = (token.custom || token.content);
    const latinized = latinize(str);
    return latinized.match(/^(?:villamos|busz?|metro|hev|troli)/i) ||
        latinized.match(/^megallo(?:bol)?$/i) ||
        latinized.match(/\bido(?:be)?\b/i);
};

const haveSameStart = (searchText, location) => {
    const searchString = latinize(searchText.split(' ')[0].toLowerCase());
    const resultString = latinize(location.title.split(' ')[0].toLowerCase());
    return searchString === resultString;
};