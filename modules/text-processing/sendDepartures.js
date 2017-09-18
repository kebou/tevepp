'use strict';
/**
 * Out: user, start, routeName
 */
module.exports = (bot) => {
    const Schedule = require('../../intents/schedule')(bot);

    const sendDepartures = (ctx, next) => {
        const { start, routeName, user } = ctx;
        if (!start || !routeName) {
            return next();
        }
        Schedule.sendDeparturesFromUserSearch(user, start.name, routeName);
    };
    return sendDepartures;
};