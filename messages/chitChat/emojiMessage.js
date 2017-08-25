'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const emojiMessage = (user) => {
        const text = Text.emoji(user);
        const quickReplies = QR.menu(user);
        const options = { typing: 5 };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return emojiMessage;
};
