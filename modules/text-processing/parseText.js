'use strict';
const emagyar = require('../../utils/emagyar/index');
/**
 * In: text
 * Out: emagyar, tokens
 */
module.exports = (ctx, next) => {
    return emagyar.parseText(ctx.text)
        .then(res => {
            ctx.emagyar = res;
            ctx.tokens = parseTokens(res.tokens);
            return next();
        });
};

const parseTokens = (tokens) => {
    for (let token of tokens) {
        token.hfstana = token.hfstana.match(/\[.*?\]/g);
    }
    return tokens;
};