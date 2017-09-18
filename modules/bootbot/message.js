'use strict';
const Pattern = require('../../utils/patterns');
const TextProcessor = require('../text-processing/textProcessor');
const tp = new TextProcessor();

const printCtx = (ctx, next) => {
    console.log(ctx.start);
    console.log(ctx.end);
    console.log(ctx.routeName);
    return next();
};

module.exports = (bot) => {
    const userController = require('../../controllers/userController')(bot);
    const ChitChat = require('../../intents/chitChat')(bot);
    const Schedule = require('../../intents/schedule')(bot);
    const TripPlanning = require('../../intents/tripPlanning')(bot);
    const FavouriteLocation = require('../../intents/favouriteLocation')(bot);

    tp.use(require('../text-processing/getIntent'));
    tp.use(require('../text-processing/handleIntent')(bot));

    tp.use(require('../text-processing/matchRouteName'));
    tp.use(require('../text-processing/matchSimpleRouteStopPair')(bot));
    tp.use(require('../text-processing/parseText'));
    tp.use(require('../text-processing/findStopName'));
    tp.use(require('../text-processing/findStopNameWithoutAccent'));
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

        return userController.getUser(userId)
            .then(user => tp.process(text, { user, chat, payload }));
    });
};