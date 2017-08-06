'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const greetingMessage = (user) => {
        const greeting = Text.greeting(user);
        const greetingText = Text.greetUser(user);
        const quickReplies = QR.menu(user);
        const options = { typing: true };

        return bot.sendTextMessage(user.id, greeting)
            .then(() => bot.sendTextMessage(user.id, greetingText, quickReplies, options));
    };

    return greetingMessage;
};