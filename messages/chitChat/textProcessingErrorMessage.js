'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const textProcessingErrorMessage = (user) => {
        const text = Text.textProcessingError(user);
        const quickReplies = QR.menu(user);
        const options = {  };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return textProcessingErrorMessage;
};
