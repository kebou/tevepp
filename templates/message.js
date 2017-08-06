'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const sampleMessage = (user) => {
        const text = '';
        const quickReplies = [];
        const options = {};

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return sampleMessage;
};