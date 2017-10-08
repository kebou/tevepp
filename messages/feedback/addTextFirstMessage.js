'use strict';
const Text = require('../elements/texts');

module.exports = (bot) => {
    const addTextFirstMessage = (user) => {
        const text = Text.feedback.askTextFirst(user);
        const quickReplies = [];
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return addTextFirstMessage;
};
