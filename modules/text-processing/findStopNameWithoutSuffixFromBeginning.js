'use strict';
const logger = require('winston');
const ContextLocation = require('../../models/contextLocationModel');
const { filterTokens, tokensToString } = require('./tokenFunctions');
const latinize = require('../../utils/nlg').latinize;
const Futar = require('../../controllers/futarController');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: tokens, start, end
 * Out: start, end
 */
module.exports = (ctx, next) => {
    const { tokens, start, end } = ctx;
    if (!tokens) {
        logger.error('#findStopNameWithoutSuffixFromBeginning module should be used after "tokens" property in ctx');
        return next();
    }
    // if (start && end) {
    //     return next();
    // }
    return getStopFromTokens(ctx, next);
};

const getStopFromTokens = (ctx, next) => {
    const { tokens, start, end } = ctx;
    const tokensToProcess = tokens;
    //const tokensToProcess = filterTokens(tokens, [ start && start.tokens, end && end.tokens ]);

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
    const { start, end } = ctx;
    if (res === null) {
        return next();
    }
    const location = new ContextLocation('stop', res.stop, res.tokens);
    location.type = 'stop';
    location.source = scriptName;

    ctx.locations = ctx.locations || [];
    ctx.locations.push(location);

    return next();
    /*     // ha csak kiindulás nincs
    if (!start && end) {
        ctx.start = ctx.start || {};
        ctx.start.type = 'stop';
        ctx.start.module = 'findStopNameWithoutSuffixFromBeginning';
        ctx.start.value = res.stop;
        ctx.start.tokens = res.tokens;
        return next();
    }
    // ha csak végcél nincs vagy semmi nincs
    ctx.end = ctx.end || {};
    ctx.end.type = 'stop';
    ctx.end.module = 'findStopNameWithoutSuffixFromBeginning';
    ctx.end.value = res.stop;
    ctx.end.tokens = res.tokens;

    // ha csak végcél nincs 
    if (start && !end) {
        return next();
    } */
    //return getStopFromTokens(ctx, next);
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
                    return ({ stop: prevRes, tokens: search });
                }
                return null;
            }
            return findStop(tokens, search, prevRes);
        })
        .catch(() => {
            if (prevRes) {
                search.shift();
                return ({ stop: prevRes, tokens: search });
            }
            if (tokens.length < 1) {
                return null;
            }
            return findStop(tokens, search, prevRes);
        });
};

const compareResultAndSearch = (result, search) => {
    return (latinize(result[0].rawName.split(' ')[0].toLowerCase()) === latinize(search[0].content.toLowerCase()));
};