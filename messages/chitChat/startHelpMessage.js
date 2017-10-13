'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {
    const startHelpMessage = (user) => {
        const { tripPlanning, schedule, location } = Text.startHelp(user);
        const quickReplies = QR.menu(user);
        const options = { typing: 2 };

        return bot.sendTextMessage(user.id, tripPlanning, [], {})
            .then(() => bot.sendTextMessage(user.id, schedule, [], {}))
            .then(() => bot.sendTextMessage(user.id, location, quickReplies, {}));
    };

    return startHelpMessage;
};
