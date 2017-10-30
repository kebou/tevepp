'use strict';
const logger = require('winston');
const { tokensToString } = require('./tokenFunctions');
const MapObject = require('../../models/mapObjectModel');
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
 * In: tokens, user
 * Out: map
 */
module.exports = (ctx, next) => {
    const { tokens, user } = ctx;
    if (!tokens) {
        logger.error('#generateMap module should be used after "tokens", "user" property in ctx');
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
    const { tokens, user } = ctx;
    const MAX_LENGTH = 5;

    return Promise.all(tokens.map((token, startIdx, tokens) => {
        return Promise.all(tokens.map((token, endIdx) => {
            if ((startIdx > endIdx) || (endIdx - startIdx >= MAX_LENGTH)) {
                return undefined;
            }
            // do the stuff here
            const tokensToProcess = tokens.slice(startIdx, endIdx + 1);
            const text = tokensToString(tokensToProcess);
            return tp.process(text, { tokens: tokensToProcess, elements: [], user })
                .then(ctx => {
                    const mobj = new MapObject(tokensToProcess);
                    mobj.setFromContext(ctx);
                    return mobj;
                });
        }));
    }));
};