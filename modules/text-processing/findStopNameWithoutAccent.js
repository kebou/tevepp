'use strict';
const Futar = require('../../controllers/futarController');
const latinize = require('../../utils/nlg').latinize;
/**
 * In: tokens
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { start, end } = ctx;
    if (start && end) {
        return next();
    }
    const tokens = ctx.tokens.slice().map(x => x.content);
    let startNameIndex = null;
    let endNameIndex = null;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        let startToken = hasStartSuffix(token);
        if (startToken && startToken.length > 0) {
            tokens[index] = startToken[0];
            startNameIndex = index;
        }
        let stopToken = hasEndSuffix(token);
        if (stopToken && stopToken.length > 0) {
            tokens[index] = stopToken[0];
            endNameIndex = index;
        }
    }
    return Promise.all([getStopFromTokens(tokens, startNameIndex), getStopFromTokens(tokens, endNameIndex)])
        .then(res => {
            if (res[0] !== null) {
                ctx.start = res[0];
            }
            if (res[1] !== null) {
                ctx.end = res[1];
            }
            return next();
        })
        .catch(() => {
            return next();
        });
};

const getStopFromTokens = (tokens, index) => {
    if (index === null) {
        return Promise.resolve(null);
    }
    let array = tokens.slice(0, index + 1);
    let search = [];
    return findStop(array, search);
};

const findStop = (array, search) => {
    search.unshift(array.pop());
    const stopName = search.reduce((a, b) => a.concat(' ' + b), '').trim();
    return Futar.searchStop(stopName)
        .then(res => {
            if (latinize(res[0].rawName.split(' ')[0].toLowerCase()) !== latinize(search[0].toLowerCase())) {
                return findStop(array, search);
            }
            return res[0];
        })
        .catch(() => {
            if (array.length < 1) {
                return Promise.reject();
            }
            return findStop(array, search);
        });
};

const hasStartSuffix = (str) => {
    const pattern = /.*(?=bol$)|.*(?=rol$)|.*(?=tol$)/i;
    return str.match(pattern);
};

const hasEndSuffix = (str) => {
    const pattern = /.*(?=hoz$)|.*(?=ig$)|.*(?=ra$)|.*(?=re$)|.*(?=ba$)|.*(?=be$)/i;
    return str.match(pattern);
};