'use strict';
const Text = require('./elements/texts');

module.exports = (bot) => {
    const chooseFromQuickRepliesMessage = (user) => {
        const text = Text.chooseFromQuickReplies(user);

        return bot.sendTextMessage(user.id, text);
    };

    return chooseFromQuickRepliesMessage;

};