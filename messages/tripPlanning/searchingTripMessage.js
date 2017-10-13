'use strict';
const Text = require('../elements/texts');

module.exports = (bot) => {

    const searchingTripMessage = (user, start, stop) => {
        const text = Text.tripPlanning.searchingTrip(user, start, stop);
        const quickReplies = [];
        const options = {};

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return searchingTripMessage;
};