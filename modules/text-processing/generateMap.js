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
    //.use(require('./findPartialLocation'))
    .use(require('./findRouteName'))
    .use(require('./findFavouriteLocation'))
    .use(require('./setScore'))
    .use(require('./returnContext'));
/**
 * In: tokens, user, MAX_WORD_NUMBER
 * Out: map
 */
module.exports = (ctx, next) => {
    const { tokens, user, MAX_WORD_NUMBER } = ctx;
    if (!tokens || !user || !MAX_WORD_NUMBER) {
        const errorMessage = '#generateMap module should be used after "tokens", "user", "MAX_WORD_NUMBER" property in ctx';
        //logger.error(errorMessage);
        const err = new Error(errorMessage);
        err.name = 'PipelineError';
        throw err;
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
            const node = new MapNode(tokensToProcess);
            return tp.process(text, { node, user, tokens })
                .then(ctx => ctx.node);
        }));
    }));
};



const generateMap2 = (ctx) => {
    const { tokens, user, MAX_WORD_NUMBER } = ctx;

    return Promise.all(tokens.map((token, startIdx, tokens) => {
        let skipLocation = false;
        return tokens.reduce((prev, token, endIdx) => {
            return prev.then(array => {
                if ((startIdx > endIdx) || (endIdx - startIdx >= MAX_WORD_NUMBER)) {
                    array.push(undefined);
                    return array;
                }

                if (shouldSkipLocation(array)) {
                    skipLocation = true;
                }

                const tokensToProcess = tokens.slice(startIdx, endIdx + 1);
                const text = tokensToString(tokensToProcess);
                const node = new MapNode(tokensToProcess);
                return tp.process(text, { node, user, tokens, skipLocation })
                    .then(ctx => {
                        array.push(ctx.node);
                        return array;
                    });
            });
        }, Promise.resolve([]));
    }));
};

const shouldSkipLocation = (array) => {
    return false;
    return array.length > 1 && 
        array[array.length - 1] !== undefined &&
        array[array.length - 2] !== undefined &&
        !hasLocationElement(array[array.length - 1]) &&
        hasLocationElement(array[array.length - 2]);
};

const hasLocationElement = (node) => {
    return node && node.elements.findIndex(element => element.type === 'location');
};

const hasNodeWithLocation = (array) => {
    return array.filter(node => hasLocationElement(node)).length;
};
