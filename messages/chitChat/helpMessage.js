'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const helpMessage = (user) => {
        //const text = Text.help(user);
        const quickReplies = QR.menu(user);
        //const options = { typing: true };
        const element = {
            title: Text.help(user)
        };

        //return bot.sendTextMessage(user.id, text, quickReplies, options);
        return bot.sendGenericTemplate(user.id, [element], { quickReplies, typing: true });
    };

    return helpMessage;
};
