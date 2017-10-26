'use strict';

const filterTokens = (tokens, tokenArrays) => {
    return tokens.filter(token => {
        for (let array of tokenArrays) {
            if (_containsToken(array, token)) {
                return false;
            }
        }
        return true;
    });
};

const _containsToken = (array, token) => {
    return (array && array.findIndex(x => x.id === token.id) >= 0);
};

const tokensToString = (tokens) => {
    return tokens.reduce((prev, x) => prev.concat(' ' + (x.custom || x.content)), '').trim();
};

module.exports = {
    filterTokens,
    tokensToString
};