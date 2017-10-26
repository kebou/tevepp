'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const { filterTokens, tokensToString } = require('./tokenFunctions');
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
        logger.error('#addressWithNumber module should be used after "tokens" property in ctx');
        return next();
    }
    const indexes = getIndexes(ctx);
    return getLocationFromTokens(indexes, ctx, next);
};

const getLocationFromTokens = (indexes, ctx, next) => {
    const { tokens } = ctx;
    const searchArrays = getSearchArrays(tokens, indexes);
    return iterateSearchArrays(searchArrays)
        .then(res => setContext(res, ctx, next))
        .catch(err => {
            logger.warn(err);
            return next();
        });
};

const setContext = (res, ctx, next) => {
    res && res.length > 0 && res.map(res => {
        if (!res) return;

        const location = new ContextLocation('location', res.location, res.tokens);
        location.source = scriptName;
        if (res.partial) {
            location.source += 'Partial'
        }

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
    return tokens.reduce((array, token, index) => {
        if (isNumber(token)) {
            array.push(index);
        }
        return array;
    }, []);
};

const isNumber = (token) => {
    return token.hfstana && (token.hfstana[0] === '[/Num]' || token.hfstana[0] === '[/Num|Digit]' || !isNaN(token.content));
};