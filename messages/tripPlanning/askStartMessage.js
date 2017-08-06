'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const askStartMessage = (user) => {
        const text = Text.tripPlanning.askStart(user);
        const hint = Text.locationHint(user);
        const quickReplies = [QR.location(), ...QR.favouriteLocations(user), QR.cancel(user)];
        const options = { typing: true };
        return bot.sendTextMessage(user.id, text, [], options)
            .then(() => bot.sendTextMessage(user.id, hint, quickReplies));
    };

    return askStartMessage;
};