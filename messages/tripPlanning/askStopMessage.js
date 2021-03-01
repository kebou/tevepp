'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const askStopMessage = (user) => {
        const text = Text.tripPlanning.askStop(user);
        const hint = Text.locationHint(user);
        const quickReplies = [
            QR.cancel(user),
            ...QR.favouriteLocations(user)
        ];
        const options = { typing: true };
        return bot.sendTextMessage(user.id, text, [], options)
            .then(() => bot.sendTextMessage(user.id, hint, quickReplies));
    };

    return askStopMessage;
};