'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const tripPlanningFailedMessage = (user) => {
        const tripPlanningFailed = Text.tripPlanning.failed(user);
        const noService = Text.tripPlanning.noTransportService(user);
        const quickReplies = QR.menu(user);
        const options = { typing: true };

        return bot.sendTextMessage(user.id, tripPlanningFailed, [], options)
            .then(() => bot.sendTextMessage(user.id, noService, quickReplies, options));
    };

    return tripPlanningFailedMessage;
};