'use strict';
const latinize = require('../../utils/nlg').latinize;
const Location = require('../../controllers/locationController');
/**
 * In: tokens
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { start, end, tokens } = ctx;
    if (!tokens) {
        console.error('findAddressWithSuffix module should be used after "tokens" property in ctx');
        return next();
    }
    if (start && end) {
        return next();
    }
    let tokensToProcess = tokens.filter(token => filterTokens(token, start, end));
    let startNameIndex = null;
    let endNameIndex = null;
    for (let index = 0; index < tokensToProcess.length; index++) {
        const token = tokensToProcess[index].content;
        let startToken = hasStartSuffix(latinize(token));
        if (startToken && startToken.length > 0) {
            tokensToProcess[index].content = tokensToProcess[index].content.substring(0, startToken[0].length);
            startNameIndex = index;
        }
        let stopToken = hasEndSuffix(token);
        if (stopToken && stopToken.length > 0) {
            tokensToProcess[index].content = tokensToProcess[index].content.substring(0, stopToken[0].length);
            endNameIndex = index;
        }
    }

    //let promises = [Promise.resolve(null), Promise.resolve(null)];
    // let startPromise = Promise.resolve(null);
    // let endPromise = Promise.resolve(null);
    if (start) {
        startNameIndex = null;
    }
    if (end) {
        endNameIndex = null;
    }
    // kisebb indexű rész vizsgálata először
    let indexes = [{}, {}];
    if (startNameIndex <= endNameIndex) {
        indexes[0].index = startNameIndex;
        indexes[0].type = 'start';
        indexes[1].index = endNameIndex;
        indexes[1].type = 'end';
    } else {
        indexes[0].index = endNameIndex;
        indexes[0].type = 'end';
        indexes[1].index = startNameIndex;
        indexes[1].type = 'start';
    }

    return getLocationFromTokens(tokensToProcess, indexes[0].index)
        .then(res => {
            if (res === null) {
                return;
            }
            ctx[indexes[0].type] = ctx[indexes[0].type] || {};
            ctx[indexes[0].type].type = 'location';
            ctx[indexes[0].type].module = 'findAddressWithSuffix';
            ctx[indexes[0].type].value = res.location;
            ctx[indexes[0].type].tokens = res.tokens;
            tokensToProcess = tokens.filter(token => filterTokens(token, ctx[indexes[0].type], null));
        })
        .then(() => getLocationFromTokens(tokensToProcess, indexes[1].index))
        .then(res => {
            if (res === null) {
                return next();
            }
            ctx[indexes[1].type] = ctx[indexes[1].type] || {};
            ctx[indexes[1].type].type = 'location';
            ctx[indexes[1].type].module = 'findAddressWithSuffix';
            ctx[indexes[1].type].value = res.location;
            ctx[indexes[1].type].tokens = res.tokens;
            return next();
        })
        .catch(() => {
            return next();
        });
};

const getLocationFromTokens = (tokens, index) => {
    if (index === null) {
        return Promise.resolve(null);
    }
    let search = tokens.slice(0, index + 1);
    return findLocation(search);
};

const findLocation = (search) => {
    const locationString = search.reduce((sum, x) => sum.concat(' ' + x.content), '').trim();
    return Location.searchLocation(locationString)
        .then(res => {
            return Promise.resolve({ location: res, tokens: search });
        })
        .catch(() => {
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

const hasStartSuffix = (str) => {
    const pattern = /.*(?=bol$)|.*(?=rol$)|.*(?=tol$)/i;
    return str.match(pattern);
};

const hasEndSuffix = (str) => {
    const pattern = /.*(?=hoz$)|.*(?=ig$)|.*(?=ra$)|.*(?=re$)|.*(?=ba$)|.*(?=be$)/i;
    return str.match(pattern);
};