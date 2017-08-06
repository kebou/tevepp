'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');
const config = require('config');

const SERVER_URL = process.env.SERVER_URL || config.get('serverURL');

module.exports = (bot) => {
    const tripDetailsMessage = (user, legs) => {
        const elements = legs.map(leg => _formatElement(user, leg));
        const quickReplies = QR.menu(user);
        const options = {};

        return bot.sendGenericTemplate(user.id, elements, { quickReplies });
    };

    return tripDetailsMessage;
};

const _formatElement = (user, leg) => {
    return {
        title: Text.tripPlanning.detailsTitle(user, leg),
        image_url: SERVER_URL + '/image/' + leg.imageId,
        buttons: [
            Button.mapForWalk(user, leg.from)
        ]
    };
};