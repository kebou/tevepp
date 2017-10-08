'use strict';

module.exports = (bot) => {
    const userController = require('../../controllers/userController')(bot);
    const ChitChat = require('../../intents/chitChat')(bot);

    bot.setGetStartedButton(payload => {
        return userController.getUser(payload.sender.id)
            .then(user => ChitChat.sendGreeting(user));
    });

    bot.setPersistentMenu([
        {
            title: '🗺 Útvonaltervezés',
            type: 'postback',
            payload: 'PLAN_TRIP'
        },
        {
            title: '📍 Kedvenc Helyek',
            type: 'postback',
            payload: 'LOCATION_LIST'
        },
        {
            title: '💬 Továbbiak',
            type: 'nested',
            call_to_actions: [
                {
                    title: '🔄 Visszajelzés küldése',
                    type: 'postback',
                    payload: 'FEEDBACK'
                },
                {
                    title: '❓ Segítség',
                    type: 'postback',
                    payload: 'HELP'
                }
            ]
        }
    ]);

    bot.setGreetingText([
        {
            locale: 'default',
            text: '🚊 Gyors, hasznos információk a fővárosi tömegközlekedéssel kapcsolatban.\nÚtvonaltervezés, indulási idők.'
        }
    ]);
};