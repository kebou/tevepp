'use strict';
const BootBot = require('bootbot');
const QR = require('./elements/quickreplies');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }

    const StartStopPicker = (user, location) => {
        const element = {
            title: location.shortTitle,
            subtitle: location.city || '',
            image_url: 'http://i.imgur.com/rUClTxH.png'
        };
        const quickReplies = [QR.planFromHere(user, location), QR.planToHere(user, location), ...QR.menu(user)];

        return bot.sendGenericTemplate(user.id, [element], { quickReplies });
    };

    return StartStopPicker;
};