'use strict';
const logger = require('winston');
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
        logger.error('#stopNameMorph module should be used after "tokens" property in ctx');
        return next();
    }
    const indexes = getIndexes(ctx);
    return getStopFromTokens(indexes, ctx, next);
};

const getStopFromTokens = (indexes, ctx, next) => {
    const { tokens } = ctx;
    const startSearchArrays = getSearchArrays(tokens, indexes.start);
    const endSearchArrays = getSearchArrays(tokens, indexes.end);
    return Promise.all([valami(startSearchArrays), valami(endSearchArrays)])
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

const valami = (searchArrays) => {
    const promises = searchArrays.map((search) => findStop(search));
    return Promise.all(promises);
};

const getSearchArrays = (tokens, indexes) => {
    return indexes.map(index => getTokensFromIndex(tokens, index));
};

const getIndexes = (ctx) => {
    const { tokens } = ctx;
    const startIndexes = [];
    const endIndexes = [];

    for (let index = 0; index < tokens.length; index++) {
        const hfstana = tokens[index].hfstana;
        const suffix = hfstana && hfstana.length > 0 && hfstana[hfstana.length - 1];
        if (!suffix) {
            continue;
        }
        if (isStartSuffix(suffix)) {
            startIndexes.push(index);
        }
        if (isEndSuffix(suffix)) {
            endIndexes.push(index);
        }
    }
    return {
        start: startIndexes,
        end: endIndexes
    };
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

const getTokensFromIndex = (tokens, index) => {
    const search = [];
    let idx = index;
    while (idx !== -1 && (isNoun(tokens[idx]) || isNumber(tokens[idx]))) {
        search.push(tokens[idx]);
        idx--;
    }
    search.reverse();
    return search;
};

const isNumber = (token) => {
    return (token.hfstana[0] === '[/Num]' || token.hfstana[0] === '[/Num|Digit]' || isNaN(token.content));
};

const isNoun = (token) => {
    return (token.content.match(/\W/i) !== null || token.hfstana[0] === '[/N]');
};

const isStartSuffix = (suffix) => {
    return (suffix === '[Ela]' || suffix === '[Del]' || suffix === '[Abl]');
};

const isEndSuffix = (suffix) => {
    return (suffix === '[Ill]' || suffix === '[Subl]' || suffix === '[All]' || suffix === '[Ter]');
};

const compareResultAndSearch = (result, search) => {
    return (latinize(result[0].rawName.split(' ')[0].toLowerCase()) === latinize(search[0].lemma.toLowerCase()));
};

const tokensToString = (tokens) => {
    return tokens.reduce((prev, x) => prev.concat(' ' + x.lemma), '').trim();
};