'use strict';
const logger = require('winston');
const Emagyar = require('emagyar');
const GATE_URL = process.env.GATE_URL;
let emagyar;
if (process.env.EMAGYAR !== undefined) {
    emagyar = require('../../utils/emagyar-web');
    logger.debug('Using emagyar-web.');
} else {
    emagyar = new Emagyar(GATE_URL, ['emToken', 'emMorph', 'emTag']);
    logger.debug('Using emagyar module.');
}
//'QT,HFSTLemm,ML3-PosLem-hfstcode'
/**
 * In: text
 * Out: emagyar, tokens, tokensContent
 */
module.exports = (ctx, next) => {
    return emagyar.parseText(ctx.text)
        .then(res => {
            ctx.emagyar = res;
            ctx.tokens = parseTokens(res.tokens);
            logger.debug('Parsed tokens:', ctx.tokens);
            return next();
        })
        .catch(err => {
            logger.error(err);
            return next();
        });
};

const parseTokens = (tokens) => {
    for (let token of tokens) {
        token.hfstana = token.hfstana.match(/\[.*?\]/g);
    }
    return tokens;
};
