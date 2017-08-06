'use strict';
const Buttons = require('../elements/buttons');
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const tripWalkDistanceMessage = (user, location) => {
        const text = Text.tripPlanning.walkingDistance(user);
        const buttons = [Buttons.mapForWalk(user, location)];
        const quickReplies = QR.menu(user);

        return bot.sendButtonTemplate(user.id, text, buttons, { quickReplies });
    };

    return tripWalkDistanceMessage;
};