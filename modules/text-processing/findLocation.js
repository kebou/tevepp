'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const MapElement = require('../../models/mapElementModel');
const Pattern = require('../../utils/patterns');
const latinize = require('latenize');
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
    if (skipLocation || shouldSkip(node)) {
        return next();
    }
    
    return Location.searchLocation(node.text, { minConfidence: 0 })
        .then(res => {
            if (res.title === '' || res.title.startsWith(',')) {
                return next();
            }
            //console.log(node.text);
            //console.log(res);
            const element = new MapElement('location', res);
            element.source = scriptName;

            node.elements = node.elements || [];
            node.elements.push(element);
            return next();
        })
        .catch(() => next());
};

const shouldSkip = (node) => {
    const firstToken = node.tokens[0];
    return isNumber(firstToken) ||
        startsWith(firstToken);
};

const isNumber = (token) => {
    return token.hfstana && (token.hfstana[0] === '[/Num]' || token.hfstana[0] === '[/Num|Digit]' || !isNaN(token.custom || token.content));
};

const startsWith = (token) => {
    const str = (token.custom || token.content);
    const latinized = latinize(str);
    return latinized.match(/\bter(?:rol)?\b/i) ||
        latinized.match(/\butca/i) ||
        latinized.match(/\but\b/i) ||
        latinized.match(/\butvonal\b/i) ||
        latinized.match(/\bmenni/i) ||
        latinized.match(/\bkovetkezo/i) ||
        latinized.match(/^(?:villamos|busz?|metro|hev|troli)/i) ||
        latinized.match(/^megallo(?:bol)?$/i) ||
        latinized.match(/\bido(?:be)?\b/i) ||
        latinized.match(/^[0-9]+/i) ||
        latinized.match(Pattern.routeNameInText());
};