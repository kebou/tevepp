'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const Futar = require('../../controllers/futarController');
const latinize = require('../../utils/nlg').latinize;
const { filterTokens, tokensToString } = require('./tokenFunctions');
/**
 * In: tokens
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { start, end, tokens } = ctx;
    if (!tokens) {
        logger.error('#findStopNameWithoutSuffix module should be used after "tokens" property in ctx');
        return next();
    }
    if (start && end) {
        return next();
    }
    let tokensToProcess = filterTokens(tokens, [ start && start.tokens, end && end.tokens ]);
    return getLocationFromTokens(ctx, next, tokensToProcess, start, end);
};

const getLocationFromTokens = (ctx, next, tokens, start, end) => {
    if (tokens.length < 1) {
        return next();
    }
    const search = tokens.slice();
    return findStop(search)
        .then(res => {
            if (res === null) {
                return next();
            }
            // ha csak kiindulás nincs
            if (!start && end) {
                ctx.start = ctx.start || {};
                ctx.start.type = 'stop';
                ctx.start.module = 'findStopNameWithoutSuffix';
                ctx.start.value = res.location;
                ctx.start.tokens = res.tokens;
                return next();
            }

            // ha csak végcél nincs vagy semmi nincs
            ctx.end = ctx.end || {};
            ctx.end.type = 'stop';
            ctx.end.module = 'findStopNameWithoutSuffix';
            ctx.end.value = res.location;
            ctx.end.tokens = res.tokens;
            // ha csak végcél nincs
            if (start && !end) {
                return next();
            }
            tokens = filterTokens(tokens, [ ctx.start && ctx.start.tokens, ctx.end && ctx.end.tokens ]);
            return getLocationFromTokens(ctx, next, tokens, ctx.start, ctx.end);
        })
        .catch(err => {
            logger.warn(err);
            return next();
        });
};

const findStop = (search) => {
    const locationString = tokensToString(search);
    return Futar.searchStop(locationString)
        .then(res => {
            if (!compareResultAndSearch(res, search)) {
                return null;
            }
            return ({ location: res[0], tokens: search });
        })
        .catch(() => {
            if (search.length < 1) {
                return null;
            }
            search.shift();
            return findStop(search);
        });
};

// const findStopFromBeginnig = (tokens, search, prevRes) => {
//     search.unshift(tokens.pop());
//     const stopName = tokensToString(search);
//     return Futar.searchStop(stopName)
//         .then(res => {
//             if (compareResultAndSearch(res, search)) {
//                 prevRes = res[0];
//             }
//             if (tokens.length < 1) {
//                 if (prevRes) {
//                     return ({ stop: prevRes, tokens: search });
//                 }
//                 return null;
//             }
//         })
//         .catch(() => {
//             if (prevRes) {
//                 search.shift();
//                 return ({ stop: prevRes, tokens: search });
//             }
//             if (tokens.length < 1) {
//                 return null;
//             }
//             return findStopFromBeginnig(tokens, search, prevRes);
//         });
// };

const compareResultAndSearch = (result, search) => {
    return (latinize(result[0].rawName.split(' ')[0].toLowerCase()) === latinize(search[0].content.toLowerCase()));
};