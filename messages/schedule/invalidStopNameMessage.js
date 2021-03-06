'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const invalidStopNameMessage = (user) => {
        const text = Text.schedule.invalidStopName(user);
        const quickReplies = QR.menu(user);
        const options = { typing: 1 };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return invalidStopNameMessage;
};