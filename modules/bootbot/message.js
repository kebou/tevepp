'use strict';
const logger = require('winston');
const TextProcessor = require('../text-processing/textProcessor');
const tp = new TextProcessor();

const printCtx = (ctx, next) => {
    logger.info('Text:', ctx.text);
    logger.info('Start:', ctx.start);
    logger.info('End:', ctx.end);
    logger.info('RouteName:', ctx.routeName);
    return next();
};

module.exports = (bot) => {
    const userController = require('../../controllers/userController')(bot);
    const ChitChat = require('../../intents/chitChat')(bot);

    tp.use(require('../text-processing/sendTypingIndicator')(bot));
    tp.use(require('../text-processing/validateInput'));
    tp.use(require('../text-processing/getIntent'));
    tp.use(require('../text-processing/handleIntent')(bot));

    tp.use(require('../text-processing/matchSimpleRouteStopPair')(bot));
    tp.use(require('../text-processing/matchSimpleStopRoutePair')(bot));
    tp.use(require('../text-processing/parseText'));

    tp.use(require('../text-processing/findStopNameWithMorph'));
    tp.use(require('../text-processing/findStopNameWithoutAccent'));
    tp.use(require('../text-processing/findAddressWithSuffix'));
    tp.use(require('../text-processing/matchRouteName'));
    tp.use(require('../text-processing/findAddressWithNumber'));
    tp.use(require('../text-processing/findStopNameWithoutSuffix'));
    //tp.use(printCtx);

    tp.use(require('../text-processing/sendDepartures')(bot));
    tp.use(require('../text-processing/startTripPlanning')(bot));
    tp.use(require('../text-processing/outOfScope')(bot));


    // járat, megálló indulás keresése (pl.: H5 szépvölgyi út)
    // bot.hear(Pattern.routeNameWithDelimiterAfter(), payload => {
    //     const userId = payload.sender.id;
    //     const text = payload.message.text;

    //     userController.getUser(userId)
    //         .then(user => {
    //             const matches = text.match(Pattern.routeNameWithDelimiterAfter());
    //             const delimiter = matches[0].slice(-1);
    //             const parts = text.split(delimiter);
    //             const routeName = parts.shift();
    //             const stopName = parts.reduce((a, b) => a.concat(delimiter + b), '').substring(1).trim();
    //             return Schedule.sendDeparturesFromUserSearch(user, stopName, routeName);
    //         })
    //         .catch(console.error);
    // });

    bot.on('message', (payload, chat, data) => {
        if (payload.message.quick_reply || data.captured) return;

        const userId = payload.sender.id;
        const text = payload.message.text;

        let _user;
        return userController.getUser(userId)
            .then(user => {
                _user = user;
                logger.info(`New message received from ${user.lastName} ${user.firstName}.`);
                return user;
            })
            .then(user => tp.process(text, { user, chat, payload }))
            .catch(err => {
                logger.error(err);
                return ChitChat.sendOutOfScope(_user);
            });
    });
};