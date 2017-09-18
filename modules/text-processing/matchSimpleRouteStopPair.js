'use strict';
const Futar = require('../../controllers/futarController');
const Pattern = require('../../utils/patterns');
/**
 * In: user, text, routeName
 */
module.exports = (bot) => {
    const Schedule = require('../../intents/schedule')(bot);

    const matchRouteStopPair = (ctx, next) => {
        const { user, text, routeName } = ctx;
        if (!routeName) {
            return next();
        }
        const matches = text.match(Pattern.routeNameWithDelimiterAfter());
        if (!matches || matches.length < 1) {
            return next();
        }
        const delimiter = matches[0].slice(-1);
        const parts = text.split(delimiter);
        parts.shift();
        const stopName = parts.reduce((a, b) => a.concat(delimiter + b), '').substring(1).trim();
        
        return Futar.searchStop(stopName)
            .then(res => Schedule.sendDeparturesFromUserSearch(user, res[0].name, routeName))
            .catch(() => next());
    };
    return matchRouteStopPair;
};