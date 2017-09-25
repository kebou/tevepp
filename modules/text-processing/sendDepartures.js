'use strict';
/**
 * Out: user, start, routeName
 */
module.exports = (bot) => {
    const Schedule = require('../../intents/schedule')(bot);

    const sendDepartures = (ctx, next) => {
        const { start, routeName, user } = ctx;
        if (!user) {
            const err = new Error('sendDepartures module should be used with "user" property in ctx');
            err.name = 'TextProcessingError';
            throw err;
        }
        if (!routeName || !(start && start.type === 'stop')) {
            return next();
        }
        Schedule.sendDeparturesFromUserSearch(user, start.value.name, routeName);
    };
    return sendDepartures;
};