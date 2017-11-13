'use strict';
const logger = require('winston');
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
    return latinized.match(/ter/i) ||
        latinized.match(/utca/i);
};