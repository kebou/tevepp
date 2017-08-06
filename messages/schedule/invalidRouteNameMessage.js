'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const invalidRouteNameMessage = (user) => {
        const text = Text.schedule.invalidRouteName(user);
        const quickReplies = QR.menu(user);

        return bot.sendTextMessage(user.id, text, quickReplies);
    };

    return invalidRouteNameMessage;
};