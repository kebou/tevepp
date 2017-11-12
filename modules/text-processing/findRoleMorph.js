'use strict';
const logger = require('winston');
const MapElement = require('../../models/mapElementModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: node
 * Out: role, text
 */
module.exports = (ctx, next) => {
    const { node } = ctx;
    if (!node) {
        logger.error('#findRoleMorph module should be used after "node" property in ctx');
        return next();
    }
    
    const token = node.tokens[node.tokens.length -1];
    const suffix = token.hfstana && token.hfstana.length > 0 && token.hfstana[token.hfstana.length - 1];

    const startSuffix = isStartSuffix(suffix);
    const endSuffix = isEndSuffix(suffix);

    if (!startSuffix && !endSuffix) {
        return next();
    }

    let value;
    if (startSuffix) {
        value = 'start';
    }
    if (endSuffix) {
        value = 'end';
    }
    token.custom = token.lemma;

    const element = new MapElement('morph', value);
    element.source = scriptName;
    node.role = element;
    // szöveg frissítése a ragok nélküli verzióval
    ctx.text = node.text;
    
    return next();
};

const isStartSuffix = (suffix) => {
    return suffix && (suffix === '[Ela]' || suffix === '[Del]' || suffix === '[Abl]');
};

const isEndSuffix = (suffix) => {
    return suffix && (suffix === '[Ill]' || suffix === '[Subl]' || suffix === '[All]' || suffix === '[Ter]');
};