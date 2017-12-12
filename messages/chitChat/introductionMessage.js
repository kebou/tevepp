'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const introductionMessage = (user) => {
        const text = Text.introduction(user);
        const startHelp = Text.startHelp(user);
        const quickReplies = QR.menu(user);
        const options = { typing: 1 };

        return bot.sendTextMessage(user.id, text)
            .then(() => bot.sendTextMessage(user.id, startHelp, quickReplies, options));
    };

    return introductionMessage;
};
