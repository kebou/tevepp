'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const latinize = require('../../utils/nlg').latinize;
const { tokensToString } = require('./tokenFunctions');
const ContextLocation = require('../../models/contextLocationModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: tokens
 * Out: locations
 */
module.exports = (ctx, next) => {
    const { tokens } = ctx;
    if (!tokens) {
        logger.error('#addressWithSuffix module should be used after "tokens" property in ctx');
        return next();
    }
    const indexes = getIndexes(ctx);
    return getLocationFromTokens(indexes, ctx, next);
};

const getLocationFromTokens = (indexes, ctx, next) => {
    const { tokens } = ctx;
    const startSearchArrays = getSearchArrays(tokens, indexes.start);
    const endSearchArrays = getSearchArrays(tokens, indexes.end);
    return Promise.all([iterateSearchArrays(startSearchArrays), iterateSearchArrays(endSearchArrays)])
        .then(res => setContext(res, ctx, next))
        .catch(err => {
            logger.warn(err);
            return next();
        });
};

const setContext = (res, ctx, next) => {
    // set start locations
    res[0] && res[0].length > 0 && res[0].map(res => {
        if (!res) return;

        const location = new ContextLocation('location', res.location, res.tokens);
        location.source = scriptName;
        if (res.partial) {
            location.source += 'Partial';
        }
        location.role = 'start';

        ctx.locations = ctx.locations || [];
        ctx.locations.push(location);
    });
    // set end locations
    res[1] && res[1].length > 0 && res[1].map(res => {
        if (!res) return;

        const location = new ContextLocation('location', res.location, res.tokens);
        location.source = scriptName;
        if (res.partial) {
            location.source += 'Partial';
        }
        location.role = 'end';

        ctx.locations = ctx.locations || [];
        ctx.locations.push(location);
    });
    return next();
};

const iterateSearchArrays = (searchArrays) => {
    const promises = searchArrays.map(search => {
        let partial = null;
        return findLocation(search, partial);
    });
    return Promise.all(promises);
};

const getSearchArrays = (tokens, indexes) => {
    return indexes.map(index => getTokensFromIndex(tokens, index));
};

const getTokensFromIndex = (tokens, index) => {
    return tokens.slice(0, index + 1);
};

const findLocation = (search, partial) => {
    const locationString = tokensToString(search);
    return Location.searchLocation(locationString)
        .then(res => {
            console.log(locationString, '-', res);
            return res;
        })
        .then(res => ({ location: res, tokens: search }))
        .catch(() => searchPartialLocation(locationString, search, partial));
};

const searchPartialLocation = (text, search, partial) => {
    return Location.searchLocation(text, { partial: true })
        .then(res => {
            if (!partial) {
                partial = { location: res, tokens: search, partial: true };
            }
            // ne legyen keresés csak a házszámra
            if (search.length <= 2) {
                return partial;
            }
            search.shift();
            return findLocation(search, partial);
        })
        .catch(() => {
            if (search.length <= 2) {
                if (partial) {
                    return partial;
                }
                return null;
            }
            search.shift();
            return findLocation(search, partial);
        });
};

const getIndexes = (ctx) => {
    const { tokens } = ctx;

    return tokens.reduce((indexes, token, index) => {
        const latinizedToken = latinize(token.content);
        const startToken = isStartToken(latinizedToken);
        if (startToken && startToken.length > 0) {
            token.custom = startToken[0];
            indexes.start.push(index);
        }
        const endToken = isEndToken(latinizedToken);
        if (endToken && endToken.length > 0) {
            token.custom = endToken[0];
            indexes.end.push(index);
        }
        return indexes;
    }, { start: [], end: [] });
};

const isStartToken = (str) => {
    const pattern = /.*(?=bol$)|.*(?=rol$)|.*(?=tol$)/i;
    return str.match(pattern);
};

const isEndToken = (str) => {
    const pattern = /.*(?=hoz$)|.*(?=ig$)|.*(?=ra$)|.*(?=re$)|.*(?=ba$)|.*(?=be$)/i;
    return str.match(pattern);
};