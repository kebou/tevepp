'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const skipImageUploadMessage = (user) => {
        const text = Text.feedback.skipImageUpload(user);
        const quickReplies = [ QR.sendFeedback(user), QR.cancel(user) ];
        const options = { };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return skipImageUploadMessage;
};
