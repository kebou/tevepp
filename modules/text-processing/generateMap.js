'use strict';
const logger = require('winston');
const { tokensToString } = require('./tokenFunctions');
const MapNode = require('../../models/mapNodeModel');
const TextProcessor = require('./textProcessor');


const tp = new TextProcessor();

tp.use(require('./findRoleMorph'))
    .use(require('./findRoleRegexp'))
    .use(require('./findStop'))
    .use(require('./findLocation'))
    .use(require('./findPartialLocation'))
    .use(require('./findRouteName'))
    .use(require('./findFavouriteLocation'))
    .use(require('./returnContext'));
/**
 * In: tokens, user, MAX_WORD_NUMBER
 * Out: map
 */
module.exports = (ctx, next) => {
    const { tokens, user, MAX_WORD_NUMBER } = ctx;
    if (!tokens || !user || !MAX_WORD_NUMBER) {
        logger.error('#generateMap module should be used after "tokens", "user", "MAX_WORD_NUMBER" property in ctx');
        return next();
    }
    return generateMap(ctx)
        .then(map => {
            ctx.map = map;
            return next();
        })
        .catch(err => {
            logger.warn(err);
            return next();
        });
};

const generateMap = (ctx) => {
    const { tokens, user, MAX_WORD_NUMBER } = ctx;

    return Promise.all(tokens.map((token, startIdx, tokens) => {
        return Promise.all(tokens.map((token, endIdx) => {
            if ((startIdx > endIdx) || (endIdx - startIdx >= MAX_WORD_NUMBER)) {
                return undefined;
            }
            // do the stuff here
            const tokensToProcess = tokens.slice(startIdx, endIdx + 1);
            const text = tokensToString(tokensToProcess);
            return tp.process(text, { tokens: tokensToProcess, elements: [], user })
                .then(ctx => {
                    const node = new MapNode(tokensToProcess);
                    node.setFromContext(ctx);
                    return node;
                });
        }));
    }));
};