'use strict';
const QR = require('../elements/quickreplies');
const config = require('config');

const SERVER_URL = process.env.SERVER_URL || config.get('serverURL');

module.exports = (bot) => {
    
    const departureMessage = (user, data, location) => {
        const elements = data.map(_formatElement);
        let quickReplies = QR.menu(user);

        if (location !== undefined) {
            quickReplies = [QR.planFromHere(user, location), ...QR.menu(user)];
        }

        return bot.sendGenericTemplate(user.id, elements, { quickReplies });
    };

    const _formatElement = (departures) => {
        return {
            title: departures.stop.rawName,
            image_url: SERVER_URL + '/image/' + departures.imageId,
        };
    };

    return departureMessage;
};