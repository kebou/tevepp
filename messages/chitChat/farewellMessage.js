'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const farewellMessage = (user) => {
        const text = Text.farewell(user);
        const comeBack = Text.comeBack(user);
        const quickReplies = QR.menu(user);
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, [], options)
            .then(() => bot.sendTextMessage(user.id, comeBack, quickReplies, options));
    };

    return farewellMessage;
};
