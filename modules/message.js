'use strict';
const Pattern = require('../utils/patterns');

module.exports = (bot) => {
    const userController = require('../controllers/userController')(bot);
    const ChitChat = require('../intents/chitChat')(bot);
    const Schedule = require('../intents/schedule')(bot);
    const TripPlanning = require('../intents/tripPlanning')(bot);
    const FavouriteLocation = require('../intents/favouriteLocation')(bot);

    // járat, megálló indulás keresése (pl.: 17, Széna tér)
    bot.hear(Pattern.routeNameWithDelimiter(','), payload => {
        const userId = payload.sender.id;
        const text = payload.message.text;

        userController.getUser(userId)
            .then(user => {
                const parts = text.split(',');
                const routeName = parts[0].match(Pattern.routeName())[0];
                const stopName = parts[1].trim();
                return Schedule.sendDeparturesFromUserSearch(user, stopName, routeName);
            })
            .catch(console.error);
    });

    // járat, megálló indulás keresése (pl.: H5 szépvölgyi út)
    bot.hear(Pattern.routeNameWithDelimiter(' '), payload => {
        const userId = payload.sender.id;
        const text = payload.message.text;

        userController.getUser(userId)
            .then(user => {
                const parts = text.split(' ');
                const routeName = parts.shift().match(Pattern.routeName())[0];
                const stopName = parts.reduce((a, b) => a.concat(' ' + b), '').trim();
                return Schedule.sendDeparturesFromUserSearch(user, stopName, routeName);
            })
            .catch(console.error);
    });

    bot.on('message', (payload, chat, data) => {
        if (payload.message.quick_reply || data.captured) return;

        const userId = payload.sender.id;
        const text = payload.message.text;

        userController.getUser(userId)
            .then(user => {
                const intent = getIntent(payload.message);
                return handleIntent(user, chat, intent, text);
            });
    });

    const handleIntent = (user, chat, intent, text) => {
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


            default:
                console.error(`Unhandled intent: ${intent}`);
                console.error(`Message: ${text}`);
                return ChitChat.sendOutOfScope(user);
        }
    };

    const getIntent = (message) => {
        const intent = message.nlp && message.nlp.entities &&
            message.nlp.entities.intent && Array.isArray(message.nlp.entities.intent) &&
            message.nlp.entities.intent.length > 0 && message.nlp.entities.intent[0];

        if (!intent) {
            return null;
        }
        console.log(message.nlp.entities);
        if (intent.confidence < 0.8) {
            return 'UNKNOWN';
        }
        return intent.value.toUpperCase();
    };
};