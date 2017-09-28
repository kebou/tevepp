'use strict';
const Futar = require('../../controllers/futarController');
const latinize = require('../../utils/nlg').latinize;
/**
 * In: tokensContent
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { start, end } = ctx;
    if (!ctx.tokens) {
        console.error('findStopNameWithoutAccent module should be used after "tokens" property in ctx');
        return next();
    }
    if (start && end) {
        return next();
    }
    const tokens = ctx.tokens.map(a => Object.assign({}, a));
    let startNameIndex = null;
    let endNameIndex = null;
    for (let index = 0; index < tokens.length; index++) {
        const token = latinize(tokens[index].content);
        let startToken = hasStartSuffix(token);
        if (startToken && startToken.length > 0) {
            tokens[index].content = tokens[index].content.substring(0, startToken[0].length);
            startNameIndex = index;
        }
        let stopToken = hasEndSuffix(token);
        if (stopToken && stopToken.length > 0) {
            tokens[index].content = tokens[index].content.substring(0, stopToken[0].length);
            endNameIndex = index;
        }
    }
    // ha már korábban sikeresen feldolgozásra került start vagy end, akkor azt nem írja felül
    let promises = [Promise.resolve(null), Promise.resolve(null)];
    if (!start && startNameIndex !== null) {
        promises[0] = getStopFromTokens(tokens, startNameIndex);
    }
    if (!end && endNameIndex !== null) {
        promises[1] = getStopFromTokens(tokens, endNameIndex);
    }
    return Promise.all(promises)
        .then(res => {
            if (res[0] !== null) {
                ctx.start = ctx.start || {};
                ctx.start.type = 'stop';
                ctx.start.value = res[0].stop;
                ctx.start.tokens = res[0].tokens;
            }
            if (res[1] !== null) {
                ctx.end = ctx.end || {};
                ctx.end.type = 'stop';
                ctx.end.value = res[1].stop;
                ctx.end.tokens = res[1].tokens;
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
    let prevRes = null;
    return findStop(array, search, prevRes);
};

const findStop = (array, search, prevRes) => {
    search.unshift(array.pop());
    const stopName = search.reduce((sum, x) => sum.concat(' ' + x.content), '').trim();
    return Futar.searchStop(stopName)
        .then(res => {
            if (latinize(res[0].rawName.split(' ')[0].toLowerCase()) === latinize(search[0].content.toLowerCase())) {
                prevRes = res[0];
            }
            if (array.length < 1) {
                if (prevRes) {
                    return Promise.resolve({ stop: prevRes, tokens: search });
                }
                return Promise.resolve(null);
            }
            return findStop(array, search, prevRes);
        })
        .catch(() => {
            if (prevRes) {
                search.shift();
                return Promise.resolve({ stop: prevRes, tokens: search });
            }
            if (array.length < 1) {
                return Promise.resolve(null);
            }
            return findStop(array, search, prevRes);
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