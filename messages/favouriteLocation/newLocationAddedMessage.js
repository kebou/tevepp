'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    
    const maxLocationReachedMessage = (user, name) => {
        const text = Text.favouriteLocation.newLocationAdded(user, name);
        const quickreplies = QR.menu(user);
        const options = {};

        return bot.sendTextMessage(user.id, text, quickreplies, options);
    };

    return maxLocationReachedMessage;

};