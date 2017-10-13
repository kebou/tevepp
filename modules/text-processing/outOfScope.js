'use strict';
const logger = require('winston');
/**
 * In: user, text
 */
module.exports = (bot) => {
    const ChitChat = require('../../intents/chitChat')(bot);

    const outOfScope = (ctx) => {
        const { user, text } = ctx;
        if (!user) {
            const err = new Error('outOfScope module should be used with "user" property in ctx');
            err.name = 'TextProcessingError';
            throw err;
        }
        logger.warn('Out of Scope Message:', text, { tokens: ctx.tokens });
        return ChitChat.sendOutOfScope(user);
    };

    return outOfScope;
};