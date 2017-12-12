'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const canceledMessage = (user) => {
        const text = Text.schedule.canceled(user);
        const quickReplies = QR.menu(user);
        const options = { typing: 1 };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return canceledMessage;
};
