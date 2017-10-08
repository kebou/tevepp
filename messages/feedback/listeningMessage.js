'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const listeningMessage = (user) => {
        const text = Text.feedback.listening(user);
        const quickReplies = [ QR.cancel(user) ];
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return listeningMessage;
};
