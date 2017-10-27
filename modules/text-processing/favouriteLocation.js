'use strict';
const logger = require('winston');
/**
 * In: tokens, user
 * Out: outputs
 */
module.exports = (ctx, next) => {
    const { tokens, user } = ctx;
    if (!tokens || !user) {
        logger.error('#favouriteLocation module should be used after "tokens" and "user" property in ctx');
        return next();
    }
    
};