'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const canceledMessage = (user) => {
        const text = Text.feedback.canceled(user);
        const quickReplies = QR.menu(user);
        const options = {};

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return canceledMessage;
};
