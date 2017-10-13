'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const greetingMessage = (user) => {
        const greeting = Text.greeting(user);
        const greetingText = Text.greetUser(user);
        const startHelp = Text.startHelp(user);
        const quickReplies = QR.menu(user);
        const options = { typing: 1 };

        return bot.sendTextMessage(user.id, greeting)
            .then(() => bot.sendTextMessage(user.id, greetingText, [], {}))
            .then(() => bot.sendTextMessage(user.id, startHelp, quickReplies, options));
    };

    return greetingMessage;
};