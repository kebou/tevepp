'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const outOfScopeMessage = (user) => {
        const text = Text.outOfScope(user);
        const help = Text.help(user);
        const quickReplies = QR.menu(user);
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, [], options)
            .then(() => bot.sendTextMessage(user.id, help, quickReplies, options));
    };

    return outOfScopeMessage;
};
