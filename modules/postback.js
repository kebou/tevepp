'use strict';
const tryParseJSON = require('../utils/tryparse-json');

module.exports = (bot) => {
    const userController = require('../controllers/userController')(bot);
    const FavouriteLocation = require('../intents/favouriteLocation')(bot);
    const TripPlanning = require('../intents/tripPlanning')(bot);
    const ChitChat = require('../intents/chitChat')(bot);

    bot.on('postback', (payload, chat) => {
        const userId = payload.sender.id;
        let { type, data } = tryParseJSON(payload.postback.payload);

        if (!type) type = payload.postback.payload;

        userController.getUser(userId)
            .then(user => handlePostback(user, chat, type, data));
    });

    const handlePostback = (user, chat, type, data) => {
        switch (type) {

            case 'ADD_LOCATION':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    return FavouriteLocation.addNewLocation(convo);
                });

            case 'LOCATION_LIST':
                return FavouriteLocation.sendLocationList(user);

            case 'EDIT_LOCATION':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('location', data.location);
                    return FavouriteLocation.editLocation(convo);
                });

            case 'REMOVE_LOCATION':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('location', data.location);
                    return FavouriteLocation.removeLocation(convo);
                });

            case 'PLAN_TRIP':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    return TripPlanning.askStart(convo);
                });

            case 'TRIP_DETAILS':
                return TripPlanning.sendTripDetails(user, data.tripDetailsId);

            case 'HELP':
                return ChitChat.sendHelp(user);

            default:
                console.error(`Unknown Postback called: ${type}`);
                break;
        }
    };
};