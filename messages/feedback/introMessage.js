'use strict';
const Text = require('../elements/texts');

module.exports = (bot) => {
    const introMessage = (user) => {
        const text = Text.feedback.intro(user);
        const quickReplies = [];
        const options = { };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return introMessage;
};
