'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const locationRemovedMessage = (user, location) => {
        const text = Text.favouriteLocation.locationRemoved(user, location);
        const quickReplies = QR.menu(user);
        const options = {};

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return locationRemovedMessage;
};
