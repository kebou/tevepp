'use strict';
const logger = require('winston');
const { filterTokens, tokensToString } = require('./tokenFunctions');
const latinize = require('../../utils/nlg').latinize;
const Futar = require('../../controllers/futarController');
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
        logger.error('#stopNameFromStart module should be used after "tokens" property in ctx');
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

    let search = [];
    let prevRes = null;
    return findStop(tokensToProcess, search, prevRes)
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

const findStop = (tokens, search, prevRes) => {
    search.unshift(tokens.shift());
    const stopName = tokensToString(search);
    return Futar.searchStop(stopName)
        .then(res => {
            if (compareResultAndSearch(res, search)) {
                prevRes = res[0];
            }
            if (tokens.length < 1) {
                if (prevRes) {
                    return { stop: prevRes, tokens: search };
                }
                return null;
            }
            return findStop(tokens, search, prevRes);
        })
        .catch(() => {
            if (prevRes) {
                search.shift();
                return { stop: prevRes, tokens: search };
            }
            if (tokens.length < 1) {
                return null;
            }
            return findStop(tokens, search, prevRes);
        });
};

const getLocationTokens = (locations) => {
    return locations && locations.filter(location => location.source && location.source === scriptName).map(location => location.tokens) || [];
};

const compareResultAndSearch = (result, search) => {
    let searchString = search[0].custom || search[0].content;
    searchString = latinize(searchString.toLowerCase());
    const resultString = latinize(result[0].rawName.split(' ')[0].toLowerCase());
    return searchString === resultString;
};