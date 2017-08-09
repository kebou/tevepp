'use strict';
const Text = require('../messages/elements/texts');
const Button = require('../messages/elements/buttons');

module.exports = (bot) => {

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

    bot.setGreetingText([
        {
            locale: 'default',
            text: '🚊 Gyors, hasznos információk a fővárosi tömegközlekedéssel kapcsolatban.\nÚtvonaltervezés, indulási idők.'
        }
    ]);
};