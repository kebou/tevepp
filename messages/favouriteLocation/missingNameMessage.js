'use strict';
const Text = require('../elements/texts');

module.exports = (bot) => {
    const missingNameMessage = (user) => {
        const text = Text.favouriteLocation.missingName(user);

        return bot.sendTextMessage(user.id, text);
    };

    return missingNameMessage;

};