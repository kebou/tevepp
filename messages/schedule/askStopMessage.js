'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const askStopMessage = (user) => {
        const text = Text.schedule.askStop(user);
        const quickReplies = [QR.cancel(user)];
        const options = { typing: 1 };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return askStopMessage;
};
