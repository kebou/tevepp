'use strict';
const logger = require('winston');
const MapElement = require('../../models/mapElementModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: tokens
 * Out: role
 */
module.exports = (ctx, next) => {
    const { tokens } = ctx;
    if (!tokens) {
        logger.error('#findRoleMorph module should be used after "tokens" property in ctx');
        return next();
    }
    
    const token = tokens[tokens.length -1];
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
    ctx.role = element;

    return next();
};

const isStartSuffix = (suffix) => {
    return suffix && (suffix === '[Ela]' || suffix === '[Del]' || suffix === '[Abl]');
};

const isEndSuffix = (suffix) => {
    return suffix && (suffix === '[Ill]' || suffix === '[Subl]' || suffix === '[All]' || suffix === '[Ter]');
};