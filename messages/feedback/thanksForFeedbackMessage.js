'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const thanksForFeedbackMessage = (user) => {
        const text = Text.feedback.thanksForFeedback(user);
        const quickReplies = QR.menu(user);
        const options = { typing: 5 };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return thanksForFeedbackMessage;
};
