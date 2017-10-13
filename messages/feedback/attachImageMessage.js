'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const attachImageMessage = (user) => {
        const text = Text.feedback.attachImage(user);
        const quickReplies = [];
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return attachImageMessage;
};
