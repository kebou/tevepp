'use strict';
const logger = require('winston');
const Alias = require('../../controllers/aliasController');
const MAX_LENGTH = 200;
/**
 * In: text.
 * Out: text
 */
module.exports = (ctx, next) => {
    const { text } = ctx;
    if (typeof text !== 'string') {
        const err = new Error();
        err.name = 'InvalidTextProcessorInput';
        throw err;
    }
    if (text.length >= MAX_LENGTH) {
        ctx.text = text.substring(0, MAX_LENGTH);
        logger.verbose('Input text shortened.', { text });
    }
    ctx.text = Alias.replace(ctx.text);
    return next();
};