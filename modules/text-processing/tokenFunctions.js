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

const sortByFirstToken = (array) => {
    return array.slice().sort((a, b) => a.tokens[0].id - b.tokens[0].id);
};

module.exports = {
    filterTokens,
    tokensToString,
    sortByFirstToken
};