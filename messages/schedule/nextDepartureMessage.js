'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

module.exports = (bot) => {

    const nextDepartureMessage = (user, data, routeIds) => {
        const departure = data.departures[0];
        const text = Text.schedule.nextDeparture(user, departure.route.name, departure.timestamp);
        const quickReplies = [QR.moreDepartures(user, data.stop.id, routeIds), ...QR.menu(user)];
        const options = { typing: true };

        return bot.sendTextMessage(user.id, text, quickReplies, options);
    };

    return nextDepartureMessage;
};