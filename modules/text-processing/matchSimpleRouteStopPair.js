'use strict';
const logger = require('winston');
const Futar = require('../../controllers/futarController');
const Pattern = require('../../utils/patterns');
/**
 * In: user, text
 */
module.exports = (bot) => {
    const Schedule = require('../../intents/schedule')(bot);

    const matchRouteStopPair = (ctx, next) => {
        const { user, text } = ctx;
        if (!user) {
            const err = new Error('matchSimpleRouteStopPair module should be used with "user" property in ctx');
            err.name = 'TextProcessingError';
            throw err;
        }
        const matches = text.match(Pattern.routeNameWithDelimiterAfter());
        if (!matches || matches.length < 1) {
            return next();
        }
        const delimiter = matches[0].slice(-1);
        const parts = text.split(delimiter);
        const routeName = parts.shift();
        const stopName = parts.reduce((a, b) => a.concat(delimiter + b), '').substring(1).trim();
        logger.debug('[matchSimpleRouteStopPair] - Possible routeName match:', { routeName, stopName });
        
        return Futar.searchStop(stopName)
            .then(res => {
                logger.verbose('[matchSimpleRouteStopPair] - stopName, routeName matched:', { text, routeName, stopName });
                return Schedule.sendDeparturesFromUserSearch(user, res[0].name, routeName);
            })
            .catch(() => next());
    };
    return matchRouteStopPair;
};