'use strict';
/**
 * In: user, text
 */
module.exports = (bot) => {
    const ChitChat = require('../../intents/chitChat')(bot);

    const outOfScope = (ctx) => {
        const { user, text } = ctx;
        console.error(`Out of Scope Message: ${text}`);
        return ChitChat.sendOutOfScope(user);
    };

    return outOfScope;
};