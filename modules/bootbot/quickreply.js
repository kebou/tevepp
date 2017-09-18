'use strict';
const tryParseJSON = require('../../utils/tryparse-json');

module.exports = (bot) => {
    const userController = require('../../controllers/userController')(bot);
    const tripPlanning = require('../../intents/tripPlanning')(bot);
    const Schedule = require('../../intents/schedule')(bot);
    const FavouriteLocation = require('../../intents/favouriteLocation')(bot);
    const ChitChat = require('../../intents/chitChat')(bot);

    bot.on('quick_reply', (payload, chat) => {
        const userId = payload.sender.id;
        let { type, data } = tryParseJSON(payload.message.quick_reply.payload);

        if (!type) type = payload.message.quick_reply.payload;

        userController.getUser(userId)
            .then(user => handleQuickReply(user, chat, type, data));
    });

    const handleQuickReply = (user, chat, type, data) => {
        switch (type) {

            case 'PLAN_FROM_HERE':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('start', data.location);
                    return tripPlanning.askStop(convo);
                });

            case 'PLAN_TO_HERE':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('stop', data.location);
                    return tripPlanning.askStart(convo);
                });

            case 'PLAN_TRIP':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    return tripPlanning.askStart(convo);
                });

            case 'DIRECTION':
                return Schedule.sendNextDeparture(user, data.stopId, data.routeIds);

            case 'MORE_DEPARTURES':
                return Schedule.sendMoreDepartures(user, data.stopId, data.routeIds);

            case 'FAVOURITES':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    return FavouriteLocation.addFirstLocation(convo);
                });

            case 'HELP':
                return ChitChat.sendHelp(user);

            default:
                return console.error(`Unknown Quick Reply called: ${type}`);
        }
    };
};