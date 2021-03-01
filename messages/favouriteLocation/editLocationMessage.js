'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const editLocationMessage = (user, location) => {
        const text = Text.favouriteLocation.editLocation(user, location);
        const hint = Text.locationHint(user);
        const quickReplies = [QR.dontModify(user), QR.cancel(user)];
        const options = {};

        return bot.sendTextMessage(user.id, text)
            .then(() => bot.sendTextMessage(user.id, hint, quickReplies));
    };

    return editLocationMessage;
};
