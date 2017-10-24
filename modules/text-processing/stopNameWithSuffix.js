'use strict';
const logger = require('winston');
const Futar = require('../../controllers/futarController');
const latinize = require('../../utils/nlg').latinize;
const ContextLocation = require('../../models/contextLocationModel');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: tokens
 * Out: locations, lemma
 */
module.exports = (ctx, next) => {
    const { tokens } = ctx;
    if (!tokens) {
        logger.error('#stopNameWithSuffix module should be used after "tokens" property in ctx');
        return next();
    }
    const indexes = getIndexes(ctx);
    return getStopFromTokens(indexes, ctx, next);
};

const getStopFromTokens = (indexes, ctx, next) => {
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
        const location = new ContextLocation('stop', res.stop, res.tokens);
        location.source = scriptName;
        location.role = 'start';

        ctx.locations = ctx.locations || [];
        ctx.locations.push(location);
    });
    // set end locations
    res[1] && res[1].length > 0 && res[1].map(res => {
        const location = new ContextLocation('stop', res.stop, res.tokens);
        location.source = scriptName;
        location.role = 'end';

        ctx.locations = ctx.locations || [];
        ctx.locations.push(location);
    });
    return next();
};

const findStop = (search, array, prevRes) => {
    search.unshift(array.pop());
    const locationString = tokensToString(search);
    return Futar.searchStop(locationString)
        .then(res => {
            if (compareResultAndSearch(res, search)) {
                prevRes = res[0];
            }
            if (array.length < 1) {
                if (prevRes) {
                    return { stop: prevRes, tokens: search };
                }
                return null;
            }
            return findStop(search, array, prevRes);
        })
        .catch(() => {
            if (prevRes) {
                search.shift();
                return { stop: prevRes, tokens: search };
            }
            if (array.length < 1) {
                return null;
            }
            return findStop(search, array, prevRes);
        });
};

const iterateSearchArrays = (searchArrays) => {
    const promises = searchArrays.map(array => {
        let search = [];
        let prevRes = null;
        return findStop(search, array, prevRes);
    });
    return Promise.all(promises);
};

const getSearchArrays = (tokens, indexes) => {
    return indexes.map(index => getTokensFromIndex(tokens, index));
};

const getTokensFromIndex = (tokens, index) => {
    return tokens.slice(0, index + 1);
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

const tokensToString = (tokens) => {
    return tokens.reduce((prev, x) => prev.concat(' ' + (x.custom || x.content)), '').trim();
};

const compareResultAndSearch = (result, search) => {
    return (latinize(result[0].rawName.split(' ')[0].toLowerCase()) === latinize(search[0].content.toLowerCase()));
};