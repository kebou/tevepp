'use strict';
const logger = require('winston');
const Futar = require('../../controllers/futarController');
const latinize = require('../../utils/nlg').latinize;
const { filterTokens, tokensToString } = require('./tokenFunctions');
const ContextLocation = require('../../models/contextLocationModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: tokens
 * Out: start, end
 */
module.exports = (ctx, next) => {
    const { tokens } = ctx;
    if (!tokens) {
        logger.error('#stopNameFromEnd module should be used after "tokens" property in ctx');
        return next();
    }
    return getStopFromTokens(ctx, next);
};

const getStopFromTokens = (ctx, next) => {
    const { tokens, locations } = ctx;
    const locationsToFilter = getLocationTokens(locations);
    const tokensToProcess = filterTokens(tokens, locationsToFilter);
    
    if (tokensToProcess.length < 1) {
        return next();
    }
    
    const search = tokensToProcess.slice();
    return findStop(search)
        .then(res => setContext(res, ctx, next))
        .catch(err => {
            logger.warn(err);
            return next();
        });
};

const setContext = (res, ctx, next) => {
    if (res === null) {
        return next();
    }
    const location = new ContextLocation('stop', res.stop, res.tokens);
    location.source = scriptName;

    ctx.locations = ctx.locations || [];
    ctx.locations.push(location);

    return getStopFromTokens(ctx, next);
};

const findStop = (search) => {
    const locationString = tokensToString(search);
    return Futar.searchStop(locationString)
        .then(res => {
            if (!compareResultAndSearch(res, search)) {
                return null;
            }
            return { stop: res[0], tokens: search };
        })
        .catch(() => {
            if (search.length < 1) {
                return null;
            }
            search.shift();
            return findStop(search);
        });
};

const getLocationTokens = (locations) => {
    return locations && locations.filter(location => location.source && location.source === scriptName).map(location => location.tokens) || [];
};

const compareResultAndSearch = (result, search) => {
    return (latinize(result[0].rawName.split(' ')[0].toLowerCase()) === latinize(search[0].content.toLowerCase()));
};