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
            return next();
        }
        const stopName = (start && start.type === 'stop' && start.value.name) || (end && end.type === 'stop' && end.value.name);
        
        if (!stopName) {
            return next();
        }
        logger.info('Sending departures:', { text: ctx.text, stopName, routeName });
        return Schedule.sendDeparturesFromUserSearch(user, stopName, routeName);
    };

    return sendDepartures;
};