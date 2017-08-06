'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const invalidRouteStopPairMessage = (user, stop, route) => {
        const text = Text.schedule.invalidRouteStopPair(user, stop, route);
        const quickreplies = QR.menu(user);

        return bot.sendTextMessage(user.id, text, quickreplies);
    };

    return invalidRouteStopPairMessage;
};