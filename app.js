'use strict';
const BootBot = require('bootbot');
const mongoose = require('mongoose');
const i18n = require('i18n');
const winston = require('winston');
const moment = require('moment');

// Setting environmental variables
const MONGO_URL = process.env.MONGO_URL;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const APP_SECRET = process.env.APP_SECRET;
const PORT = process.env.PORT || 3000;
const PING_URL = process.env.PING_URL;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Keep alive Beta on Heroku
const selfPing = require('heroku-self-ping')(PING_URL); // eslint-disable-line no-unused-vars

// Localization settings
i18n.configure({
    locales: ['hu'],
    directory: './locales',
    defaultLocale: 'hu',
    updateFiles: true,
    objectNotation: true
});

// Configuring logger
winston.clear();
winston.add(winston.transports.Console, {
    timestamp: () => {
        return moment().format();
    },
    prettyPrint: true,
    colorize: true
});
winston.level = LOG_LEVEL;
const logger = winston;

// Configuring mongoose
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, { useMongoClient: true });

// Creating bot instance
const bot = new BootBot({
    accessToken: PAGE_ACCESS_TOKEN,
    verifyToken: VERIFY_TOKEN,
    appSecret: APP_SECRET
});
// Patching sendTemplate function
bot.sendTemplate = require('./utils/sendTemplatePatch');
bot.sendMessage = require('./utils/sendMessagePatch');
bot.getUserProfile = require('./utils/getUserProfilePatch');
// Registering BootBot modules
bot.module(require('./modules/bootbot/webhooks'));
bot.module(require('./modules/bootbot/message'));
bot.module(require('./modules/bootbot/attachment'));
bot.module(require('./modules/bootbot/quickreply'));
bot.module(require('./modules/bootbot/postback'));
bot.module(require('./modules/bootbot/referral'));
bot.module(require('./modules/bootbot/messengerProfile'));

// Disconnect mongoose on app termination
const onExiting = (code) => {
    const exitCode = code || 0;
    mongoose.disconnect()
        .then(() => {
            logger.info('Mongoose is disconnected through app termination.');
            process.exit(exitCode);
        });
};
process.on('SIGINT', onExiting).on('SIGTERM', onExiting);

process.on('uncaughtException', (err) => {
    logger.error('Exiting with uncaught Exception: ' + err.toString());
    onExiting(1);
});

// Starting server
bot.start(PORT);