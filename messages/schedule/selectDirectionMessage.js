'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const selectDirectionMessage = (user, directions) => {
        const text = Text.schedule.askDirection(user);
        const quickReplies = directions.map(QR.direction);
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return selectDirectionMessage;
};