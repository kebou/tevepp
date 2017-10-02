'use strict';
const Pattern = require('../../utils/patterns');
/**
 * In: tokens, start, end
 * Out: routeName
 */
module.exports = (ctx, next) => {
    const { start, end, tokens } = ctx;
    if (!tokens) {
        console.error('matchRouteName module should be used after "tokens" property in ctx');
        return next();
    }
    
    let tokensToProcess = tokens.filter(token => filterTokens(token, start, end));
    const pattern = Pattern.routeNameInText();

    for (let token of tokensToProcess) {
        const match = token.content && token.content.match(pattern);
        if (match) {
            ctx.routeName = match[0];
        }
    }
    return next();
};

const filterTokens = (token, start, end) => {
    if (start && start.tokens && start.tokens.findIndex(x => x.id === token.id) >= 0) {
        return false;
    }
    if (end && end.tokens && end.tokens.findIndex(x => x.id === token.id) >= 0) {
        return false;
    }
    return true;
};