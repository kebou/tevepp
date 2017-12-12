'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
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

        const stop = start || end;

        if (!stop) {
            // honnan indulnál
            logger.info('Ask stop:', { text: ctx.text, routeName: routeName.value });
            return bot.conversation(user.id, convo => {
                convo.set('user', user);
                convo.set('routeName', routeName.value);
                return Schedule.askStop(convo);
            });
        }

        if (stop.type === 'stop') {
            const stopName = stop.value.title;

            logger.info('Sending departures:', { text: ctx.text, stopName, routeName: routeName.value });
            return Schedule.sendDeparturesFromUserSearch(user, stopName, routeName.value);
        }

        return Location.toStop(stop.value)
            .then(stop => {
                const stopName = stop.name;
                logger.info('Sending departures:', { text: ctx.text, stopName, routeName: routeName.value });
                return Schedule.sendDeparturesFromUserSearch(user, stopName, routeName.value);
            })
            .catch(() => {
                logger.verbose('sendDepartures skipped - no stop in context');
                return next();
            });
    };

    return sendDepartures;
};