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
    const slackController = require('../../controllers/slackController');
    const ChitChat = require('../../intents/chitChat')(bot);

    tp.use(require('../text-processing/sendTypingIndicator')(bot))
        .use(require('../text-processing/validateInput'))
        .use(require('../text-processing/getIntent'))
        .use(require('../text-processing/handleIntent')(bot))
        .use(require('../text-processing/matchSimpleRouteStopPair')(bot))
        .use(require('../text-processing/matchSimpleStopRoutePair')(bot))
        // text processing
        .use(require('../text-processing/parseText'))
        .use(require('../text-processing/generateMap'))
        .use(require('../text-processing/rankPartitions'))
        .use(require('../text-processing/setContext'))
        //.use(printCtx);
        // send response
        .use(require('../text-processing/sendDepartures')(bot))
        .use(require('../text-processing/startTripPlanning')(bot))
        .use(require('../text-processing/outOfScope')(bot));


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

        let user;
        return userController.getUser(userId)
            .then(_user => {
                user = _user;
                logger.info(`New message received from ${user.lastName} ${user.firstName}: ${text}`);
                return user;
            })
            .then(user => tp.process(text, { user, chat, payload, MAX_WORD_NUMBER: 5 }))
            .catch(err => {
                logger.error('Error in pipeline:', err);
                return handleError(user, err);
            });
    });

    const handleError = (user, err) => {
        return ChitChat.sendTextProcessingError(user)
            .then(() => slackController.sendError(err));
    };
};