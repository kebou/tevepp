'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const { filterTokens, tokensToString } = require('./tokenFunctions');
const ContextLocation = require('../../models/contextLocationModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: tokens
 * Out: locations
 */
module.exports = (ctx, next) => {
    const { tokens } = ctx;
    if (!tokens) {
        logger.error('#addressWithNumber module should be used after "tokens" property in ctx');
        return next();
    }
    const indexes = getIndexes(ctx);

};

const findLocation = (search) => {

};