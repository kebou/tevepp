'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const { filterTokens, tokensToString } = require('./tokenFunctions');
/**
 * In: tokens, start, end
 * Out: start, end
 */
module.exports = (ctx, next) => {
    const { start, end, tokens } = ctx;
    if (!tokens) {
        console.error('#matchTextAsLocation module should be used after "tokens" property in ctx');
        return next();
    }
    if (start && end) {
        return next();
    }
    let tokensToProcess = filterTokens(tokens, [start && start.tokens, end && end.tokens]);
    if (tokensToProcess.length < 1) {
        return next();
    }
    
    return matchLocation(tokensToProcess)
        .then(res => {
            if (!start && end) {
                ctx.start = ctx.start || {};
                ctx.start.type = 'location';
                ctx.start.module = 'matchTextAsLocation';
                ctx.start.value = res.location;
                ctx.start.tokens = res.tokens;
                return next();
            }

            ctx.end = ctx.end || {};
            ctx.end.type = 'location';
            ctx.end.module = 'matchTextAsLocation';
            ctx.end.value = res.location;
            ctx.end.tokens = res.tokens;
            return next();
        })
        .catch(err => {
            //logger.warn(err);
            return next();
        });
};

const matchLocation = (tokens) => {
    const locationString = tokensToString(tokens);
    return Location.searchLocation(locationString)
        .then(res => ({ location: res, tokens }));
};