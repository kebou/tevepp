'use strict';
const Button = require('../elements/buttons');
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');

const SERVER_URL = process.env.SERVER_URL;

module.exports = (bot) => {

    const tripSummaryMessage = (user, options) => {
        const elements = options.map(option => _formatElement(user, option));
        const quickReplies = QR.menu(user);
        
        return bot.sendGenericTemplate(user.id, elements, { quickReplies });
    };

    return tripSummaryMessage;
};

const _formatElement = (user, option) => {
    return {
        title: Text.tripPlanning.summaryTitle(user, option),
        subtitle: Text.tripPlanning.summarySubtitle(user, option.legs[0].from),
        image_url: SERVER_URL + '/image/' + option.imageId,
        buttons: [
            Button.mapForWalk(user, option.legs[0].from),
            Button.tripDetails(user, option)
        ]
    };
};