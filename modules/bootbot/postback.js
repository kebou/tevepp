'use strict';
const logger = require('winston');
const tryParseJSON = require('../../utils/tryparse-json');

module.exports = (bot) => {
    const userController = require('../../controllers/userController')(bot);
    const FavouriteLocation = require('../../intents/favouriteLocation')(bot);
    const TripPlanning = require('../../intents/tripPlanning')(bot);
    const ChitChat = require('../../intents/chitChat')(bot);
    const Feedback = require('../../intents/feedback')(bot);

    bot.on('postback', (payload, chat) => {
        const { sender, postback } = payload;
        const referral = postback.referral;
        const userId = sender.id;
        let { type, data } = tryParseJSON(postback.payload);

        if (!type) type = payload && postback.payload;
        if (referral) type = referral.ref.toUpperCase();

        userController.getUser(userId)
            .then(user => addUserSource(user, referral))
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

            case 'FEEDBACK':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    return Feedback.askFeedback(convo);
                });

            case 'GET_STARTED':
                return ChitChat.sendGreeting(user);

            case 'FB_DATA_COLLECTION':
                return ChitChat.sendTesterMessage(user);

            default:
                logger.warn('Unknown Postback called:', type);
                break;
        }
    };
};

const addUserSource = (user, referral) => {
    if (user.source) {
        return user;
    }
    let src = '';
    if (!referral) {
        src = 'unknown';
    } else {
        const { ref, source } = referral;
        src = source.toLowerCase();
        if (ref) {
            src += `_${ref}`;
        }
    }
    user.source = src;
    return user.save();
};