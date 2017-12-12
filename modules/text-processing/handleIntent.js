'use strict';
const logger = require('winston');
/**
 * In: user, chat, intent
 */
module.exports = (bot) => {
    const ChitChat = require('../../intents/chitChat')(bot);
    const TripPlanning = require('../../intents/tripPlanning')(bot);
    const FavouriteLocation = require('../../intents/favouriteLocation')(bot);
    const Feedback = require('../../intents/feedback')(bot);

    const handleIntent = (ctx, next) => {
        const { user, chat, intent } = ctx;
        if (!user && !chat) {
            const err = new Error('#handleIntent module should be used with "user", "chat" property in ctx');
            err.name = 'TextProcessingError';
            throw err;
        }
        switch (intent) {

            case 'GREETING_HI':
                return ChitChat.sendGreeting(user);

            case 'JOKE':
                return ChitChat.sendJoke(user);

            case 'HELP':
                return ChitChat.sendHelp(user);

            case 'PLAN_TRIP':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    return TripPlanning.askStart(convo);
                });

            case 'LOCATION_LIST':
                return FavouriteLocation.sendLocationList(user);

            case 'GREETING_WHATSUP':
                return ChitChat.sendAllIsWell(user);

            case 'GREETING_BYE':
                return ChitChat.sendFarewell(user);

            case 'THANKS':
                return ChitChat.sendWelcome(user);

            case 'FEEDBACK':
                return chat.conversation(convo => {
                    convo.set('user', user);
                    return Feedback.askFeedback(convo);
                });


            default: {
                if (intent) {
                    logger.warn('Unhandled intent:', intent);
                }
                return next();
            }
        }
    };

    return handleIntent;
};