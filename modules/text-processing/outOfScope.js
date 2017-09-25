'use strict';
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
        console.error(`Out of Scope Message: ${text}`);
        return ChitChat.sendOutOfScope(user);
    };

    return outOfScope;
};