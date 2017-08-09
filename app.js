'use strict';

const BootBot = require('bootbot');
const sendTemplatePatch = require('./utils/sendTemplatePatch');
const mongoose = require('mongoose');
const attachment = require('./modules/attachment');
const message = require('./modules/message');
const postback = require('./modules/postback');
const quickReply = require('./modules/quickreply');
const messengerProfile = require('./modules/messengerProfile');
const webhooks = require('./modules/webhooks');
const i18n = require('i18n');
const config = require('config');

const selfPing = require('heroku-self-ping')(process.env.APP_URL); // eslint-disable-line no-unused-vars

i18n.configure({
    locales: ['hu'],
    directory: './locales',
    defaultLocale: 'hu',
    updateFiles: true,
    objectNotation: true
});

const MONGO_URL = process.env.MONGO_URL || config.get('mongoURL');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || config.get('pageAccessToken');
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || config.get('verifyToken');
const APP_SECRET = process.env.APP_SECRET || config.get('appSecret');

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL);

const PORT = process.env.PORT || 3000;

const bot = new BootBot({
    accessToken: PAGE_ACCESS_TOKEN,
    verifyToken: VERIFY_TOKEN,
    appSecret: APP_SECRET
});

bot.sendTemplate = sendTemplatePatch;

bot.module(webhooks);

bot.module(message);
bot.module(attachment);
bot.module(quickReply);
bot.module(postback);

bot.module(messengerProfile);

bot.start(PORT);


const onExiting = (code) => {
    const exitCode = code || 0;
    mongoose.disconnect()
        .then(() => {
            console.log('\nMongoose is disconnected through app termination.');
            process.exit(exitCode);
        });
};

process.on('SIGINT', onExiting).on('SIGTERM', onExiting);

process.on('uncaughtException', (err) => {
    console.error('Exiting with uncaught Exception: ' + err.toString());
    onExiting(1);
});
