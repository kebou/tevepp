'use strict';
/**
 * In: payload
 * Out: Intent
 */
module.exports = (ctx, next) => {
    const { payload } = ctx;
    if (!payload) {
        const err = new Error('.process() should be called with payload property in ctx');
        err.name = 'TextProcessingError';
        throw err;
    }
    const message = payload.message;
    const intent = message.nlp && message.nlp.entities &&
        message.nlp.entities.intent && Array.isArray(message.nlp.entities.intent) &&
        message.nlp.entities.intent.length > 0 && message.nlp.entities.intent[0];

    if (intent && intent.confidence >= 0.8) {
        ctx.intent = intent.value.toUpperCase();
    }
    if (intent) {
        console.log('Intent:');
        console.log(intent);
    }
    return next();
};