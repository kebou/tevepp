'use strict';
const Location = require('../../controllers/locationController');
const Futar = require('../../controllers/futarController');
/**
 * In: tokens
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { start, end, tokens } = ctx;
    if (!tokens) {
        console.error('findAddressWithNumber module should be used after "tokens" property in ctx');
        return next();
    }
    if (start && end) {
        return next();
    }
    let tokensToProcess = tokens.filter(token => filterTokens(token, start, end));
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
        .catch(console.error);
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
                        tokens = tokens.filter(token => filterTokens(token, res, null));
                    }
                    return;
                });
        });
    }, Promise.resolve(null));
};


const findLocation = (search) => {
    const locationString = search.reduce((prev, x) => prev.concat(' ' + x.content), '').trim();

    return Location.searchLocation(locationString)
        .then(res => Promise.resolve({ location: res, tokens: search }))
        .catch((err) => {
            if (search.length < 1) {
                return Promise.resolve(null);
            }
            search.shift();
            return findLocation(search);
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