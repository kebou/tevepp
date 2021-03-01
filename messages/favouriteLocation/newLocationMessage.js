'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const newLocationMessage = (user) => {
        const text = Text.favouriteLocation.newLocation(user);
        const hint = Text.locationHint(user);
        const quickReplies = [QR.cancel(user)];
        const options = { };

        return bot.sendTextMessage(user.id, text)
            .then(() => bot.sendTextMessage(user.id, hint, quickReplies));
    };

    return newLocationMessage;
};