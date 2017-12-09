'use strict';
const logger = require('winston');
/**
 * Out: user, start, end, routeName
 */
module.exports = (bot) => {
    const Schedule = require('../../intents/schedule')(bot);

    const sendDepartures = (ctx, next) => {
        const { start, end, routeName, user } = ctx;
        if (!user) {
            const err = new Error('sendDepartures module should be used with "user" property in ctx');
            err.name = 'TextProcessingError';
            throw err;
        }
        if (!routeName) {
            logger.verbose('sendDepartures skipped - no routeName in context');
            return next();
        }
        if (start && end) {
            logger.verbose('sendDepartures skipped - start & end in context');
            return next();
        }
        const stopName = (start && start.type === 'stop' && start.value.title) || (end && end.type === 'stop' && end.value.title);
        
        if (!stopName) {
            logger.verbose('sendDepartures skipped - no stopName in context');
            return next();
        }
        logger.info('Sending departures:', { text: ctx.text, stopName, routeName: routeName.value });
        return Schedule.sendDeparturesFromUserSearch(user, stopName, routeName.value);
    };

    return sendDepartures;
};