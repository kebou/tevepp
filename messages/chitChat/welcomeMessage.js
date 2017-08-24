'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const welcomeMessage = (user) => {
        const text = Text.welcome(user);
        const quickReplies = QR.menu(user);
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return welcomeMessage;
};
