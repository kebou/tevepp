'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const newNameMessage = (user, location) => {
        const text = Text.favouriteLocation.newName(user, location);
        const hint = Text.favouriteLocation.nameHint(user);
        const quickReplies = [QR.editLocation(user), QR.cancel(user)];
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, [], options)
            .then(() => bot.sendTextMessage(user.id, hint, quickReplies));
    };

    return newNameMessage;
};