'use strict';
const logger = require('winston');
const TextProcessor = require('./textProcessor');

const nodeProcessor = new TextProcessor();
nodeProcessor.use(require('./ranking/hasRole'))
    .use(require('./ranking/absoluteLength'));

const elementProcessor = new TextProcessor();
elementProcessor.use(require('./ranking/editDistance'))
    .use(require('./ranking/relativeLength'))
    .use(require('./ranking/typeBasedRank'));

// const weights = {
//     role: {
//         morph: 5000,
//         regexp: 4000
//     },
//     absoluteLength: 5000,
//     relativeLength: 100,
//     editDistance: 100,
//     type: {
//         routeName: 100,
//         stop: 500,
//         favourite: 300,
//         location: 200
//     }
// };

const weights = {
    role: {
        morph: 22,
        regexp: 20
    },
    absoluteLength: {
        1: 100,
        2: 220,
        3: 550,
        4: 690,
        5: 300,
        6: 100
    },
    relativeLength: 10,
    editDistance: 1,
    type: {
        routeName: 10,
        stop: 10,
        favourite: 15,
        location: 1,
        partialLocation: 1
    }
};

/**
 * In: text, tokens, node
 * Out: node
 */
module.exports = (ctx, next) => {
    const { text, node } = ctx;
    if (!text || !node) {
        logger.error('#setRank module should be used after "text", "tokens" and "node" property in ctx');
        return next();
    }
    
    return Promise.all([rankNode(ctx), rankElements(ctx)])
        .then(res => {
            //console.log(res);
            return res;
        })
        .then(() => next())
        .catch(err => {
            logger.warn(err);
            return next();
        });
};

const rankNode = (ctx) => {
    const { node, tokens } = ctx;
    return nodeProcessor.process({ tokens: node.tokens, allTokens: tokens, node, weights });
};

const rankElements = (ctx) => {
    const { node } = ctx;

    return Promise.all(node.elements.map(element => {
        //console.log(element);
        return elementProcessor.process({ text: node.text, tokens: node.tokens, element, weights });
    }));
};







// tp.process({ node, elements })

// contextbe kell raknia minden element pontját és a node ranket

// node rank
// - rag
// - 