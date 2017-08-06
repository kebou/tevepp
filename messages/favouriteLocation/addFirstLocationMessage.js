'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const addFirstLocationMessage = (user) => {
        const text = Text.favouriteLocation.noFavourites(user);
        const addFirst = Text.favouriteLocation.addFirst(user);
        const quickReplies = [QR.yes(user), QR.no(user)];
        const options = {};

        return bot.sendTextMessage(user.id, text)
            .then(() => bot.sendTextMessage(user.id, addFirst, quickReplies, options));
    };

    return addFirstLocationMessage;
};
