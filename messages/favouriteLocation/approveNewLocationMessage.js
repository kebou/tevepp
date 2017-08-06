'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const approveNewLocationMessage = (user, location, name) => {
        const text = Text.favouriteLocation.approveNewLocation(user, location, name);
        const quickreplies = [QR.yes(user), QR.editName(user), QR.cancel(user)];
        const options = {};

        return bot.sendTextMessage(user.id, text, quickreplies, options);
    };

    return approveNewLocationMessage;
};