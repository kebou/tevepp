'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');
const Futar = require('../../controllers/futarController');
const { filterTokens, tokensToString } = require('./tokenFunctions');
/**
 * In: tokens
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { start, end, tokens } = ctx;
    if (!tokens) {
        logger.error('#findAddressWithNumber module should be used after "tokens" property in ctx');
        return next();
    }
    if (start && end) {
        return next();
    }
    let tokensToProcess = filterTokens(tokens, [ start && start.tokens, end && end.tokens ]);
    const indexes = getIndexes(tokensToProcess);
    let matches = [];
    return findMatches(indexes, tokensToProcess, matches)
        .then(() => {
            if (matches.length === 1) {
                ctx.end = ctx.end || {};
                ctx.end.type = 'location';
                ctx.end.module = 'findAddressWithNumber';
                ctx.end.value = matches[0].location;
                ctx.end.tokens = matches[0].tokens;

            } else if (matches.length > 1) {
                ctx.start = ctx.start || {};
                ctx.start.type = 'location';
                ctx.start.module = 'findAddressWithNumber';
                ctx.start.value = matches[0].location;
                ctx.start.tokens = matches[0].tokens;

                ctx.end = ctx.end || {};
                ctx.end.type = 'location';
                ctx.end.module = 'findAddressWithNumber';
                ctx.end.value = matches[1].location;
                ctx.end.tokens = matches[1].tokens;
            }
            return next();
        })
        .catch(logger.error);
};

const getIndexes = (tokens) => {
    const indexes = [];
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.hfstana && (token.hfstana[0] === '[/Num]' || token.hfstana[0] === '[/Num|Digit]')) {
            indexes.push(index);
        }
    }
    return indexes;
};

const findMatches = (indexes, tokens, matches) => {
    return indexes.reduce((prev, index) => {
        return prev.then(() => {
            let search = tokens.slice(0, index + 1);
            return findLocation(search)
                .then(res => {
                    if (res !== null) {
                        matches.push(res);
                        tokens = filterTokens(tokens, [ res && res.tokens ]);
                    }
                    return;
                });
        });
    }, Promise.resolve(null));
};


const findLocation = (search) => {
    const locationString = tokensToString(search);

    return Location.searchLocation(locationString)
        .then(res => ({ location: res, tokens: search }))
        .catch((err) => {
            if (search.length < 1) {
                return null;
            }
            search.shift();
            return findLocation(search);
        });
};