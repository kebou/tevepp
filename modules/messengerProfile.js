'use strict';
const Text = require('../messages/elements/texts');
const Button = require('../messages/elements/buttons');

module.exports = (bot) => {
    bot.setGreetingText('Hello!');

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
            title: '⭐️ Kedvencek',
            type: 'nested',
            call_to_actions: [
                {
                    title: '🎟️ BKK Pass',
                    type: 'web_url',
                    url: 'https://shop.bkk.hu/webpass'
                }
            ]
        }
    ]);

    bot.sendProfileRequest({
        whitelisted_domains: [
            'https://2c025365.ngrok.io'
        ]
    });
};