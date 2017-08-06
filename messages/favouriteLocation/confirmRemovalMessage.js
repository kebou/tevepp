'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const confirmRemovalMessage = (user, location) => {
        const text = Text.favouriteLocation.confirmRemoval(user, location);
        const quickReplies = [QR.yes(user), QR.no(user)];
        const options = {};

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return confirmRemovalMessage;
};
