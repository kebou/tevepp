'use strict';
const Text = require('./elements/texts');

module.exports = (bot) => {

    const invalidLocationMessage = (user) => {
        const text = Text.invalidLocation(user);

        return bot.sendTextMessage(user.id, text);
    };

    return invalidLocationMessage;
};