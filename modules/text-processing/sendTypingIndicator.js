'use strict';

module.exports = (bot) => {
    const sendTypingIndicator = (ctx, next) => {
        const { user } = ctx;
        return bot.sendAction(user.id, 'typing_on')
            .then(next);
    };

    return sendTypingIndicator;
};