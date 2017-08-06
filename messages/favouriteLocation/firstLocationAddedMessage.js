'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const firstLocationAddedMessage = (user) => {
        const text = Text.favouriteLocation.firstLocationAdded(user);
        const addHint = Text.favouriteLocation.addHint(user);
        const quickReplies = QR.menu(user);
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, [], options)
            .then(() => bot.sendTextMessage(user.id, addHint, quickReplies, options));
    };

    return firstLocationAddedMessage;
};
