'use strict';
const latinize = require('../../utils/nlg').latinize;
/**
 * In: tokensContent
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { start, end, tokensContent } = ctx;
    if (!tokensContent) {
        console.error('findAddressWithSuffix module should be used after "tokensContent" property in ctx');
        return next();
    }
    if (start && end) {
        return next();
    }
    let tokens = tokensContent.slice();
    tokens = tokens.filter(x => {
        let y = true;
        if (start && start.raw && start.raw.findIndex(i => i.id === x.id) >= 0) {
            y = false;
        }
        if (end && end.raw && end.raw.indexOf(x) >= 0) {
            y = false;
        }
        return y;
    });
    let startNameIndex = null;
    let endNameIndex = null;
    for (let index = 0; index < tokens.length; index++) {
        const token = latinize(tokens[index]);
        let startToken = hasStartSuffix(token);
        if (startToken && startToken.length > 0) {
            tokens[index] = tokens[index].substring(0, startToken[0].length);
            startNameIndex = index;
        }
        let stopToken = hasEndSuffix(token);
        if (stopToken && stopToken.length > 0) {
            tokens[index] = tokens[index].substring(0, stopToken[0].length);
            endNameIndex = index;
        }
    }



};

const hasStartSuffix = (str) => {
    const pattern = /.*(?=bol$)|.*(?=rol$)|.*(?=tol$)/i;
    return str.match(pattern);
};

const hasEndSuffix = (str) => {
    const pattern = /.*(?=hoz$)|.*(?=ig$)|.*(?=ra$)|.*(?=re$)|.*(?=ba$)|.*(?=be$)/i;
    return str.match(pattern);
};