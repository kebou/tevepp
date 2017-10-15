'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const Futar = require('../../controllers/futarController');
const latinize = require('../../utils/nlg').latinize;
/**
 * In: tokens
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { start, end, tokens } = ctx;
    if (!tokens) {
        logger.error('findAddress module should be used after "tokens" property in ctx');
        return next();
    }
    if (start && end) {
        return next();
    }

    let tokensToProcess = tokens.filter(token => filterTokens(token, start, end));
    return getLocationFromTokens(ctx, next, tokensToProcess, start, end);
};

const getLocationFromTokens = (ctx, next, tokens, start, end) => {
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
            tokens = tokens.filter(token => filterTokens(token, ctx.start, ctx.end));
            return getLocationFromTokens(ctx, next, tokens, ctx.start, ctx.end);
        })
        .catch(err => {
            logger.warn(err);
            return next();
        });
};

const findStop = (search) => {
    const locationString = search.reduce((sum, x) => sum.concat(' ' + x.content), '').trim();
    return Futar.searchStop(locationString)
        .then(res => {
            if (latinize(res[0].rawName.split(' ')[0].toLowerCase()) !== latinize(search[0].content.toLowerCase())) {
                return Promise.resolve(null);
            }
            return Promise.resolve({ location: res[0], tokens: search });
        })
        .catch(() => {
            if (search.length < 1) {
                return Promise.resolve(null);
            }
            search.shift();
            return findStop(search);
        });
};

const filterTokens = (token, start, end) => {
    if (start && start.tokens && start.tokens.findIndex(x => x.id === token.id) >= 0) {
        return false;
    }
    if (end && end.tokens && end.tokens.findIndex(x => x.id === token.id) >= 0) {
        return false;
    }
    return true;
};