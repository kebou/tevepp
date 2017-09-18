'use strict';
/**
 * In: user, chat, intent
 */
module.exports = (bot) => {
    const ChitChat = require('../../intents/chitChat')(bot);
    const TripPlanning = require('../../intents/tripPlanning')(bot);
    const FavouriteLocation = require('../../intents/favouriteLocation')(bot);

    const handleIntent = (ctx, next) => {
        const { user, chat, intent } = ctx;
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

            case 'THANKS':
                return ChitChat.sendWelcome(user);


            default: {
                if (intent) {
                    console.error(`Unhandled intent: ${intent}`);
                }
                return next();
            }
        }
    };

    return handleIntent;
};