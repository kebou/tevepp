'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

const SERVER_URL = process.env.SERVER_URL;

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
    let title, button;
    if (leg.mode === 'WALK') {
        title = Text.tripPlanning.detailsWalkTitle(user, leg);
        button = Button.mapForDestiantion(user, leg.to);
    } else {
        title = Text.tripPlanning.detailsTitle(user, leg);
        button = Button.mapForWalk(user, leg.from);
    }

    return {
        title,
        image_url: SERVER_URL + '/image/' + leg.imageId,
        buttons: [
            button
        ]
    };
};