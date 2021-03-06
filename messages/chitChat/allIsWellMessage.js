'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const allIsWellMessage = (user) => {
        const text = Text.allIsWell(user);
        const help = Text.help(user);
        const quickReplies = QR.menu(user);
        const options = { typing: 5 };

        return bot.sendTextMessage(user.id, text, [], options)
            .then(() => bot.sendTextMessage(user.id, help, quickReplies, options));
    };

    return allIsWellMessage;
};
