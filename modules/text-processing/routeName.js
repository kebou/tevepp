'use strict';
const logger = require('winston');
const Pattern = require('../../utils/patterns');
const path = require('path');
const scriptName = path.basename(__filename).replace(/\.[^/.]+$/, '');
/**
 * In: tokens
 * Out: routeNames
 */
module.exports = (ctx, next) => {
    const { tokens } = ctx;
    if (!tokens) {
        logger.error('#routeName module should be used after "tokens" property in ctx');
        return next();
    }
    
    const routeNames = getRouteNames(ctx);
    return setContext(routeNames, ctx, next);
};

const setContext = (routeNames, ctx, next) => {
    if (routeNames && routeNames.length > 0) {
        ctx.routeNames = ctx.routeNames || [];
        ctx.routeNames = ctx.routeNames.concat(routeNames);
    }
    return next();
};

const getRouteNames = (ctx) => {
    const { tokens } = ctx;
    const pattern = Pattern.routeNameInText();

    return tokens.reduce((array, token) => {
        const match = token.content && token.content.match(pattern);
        if (match) {
            const routeName = {
                value: match[0],
                tokens: [token],
                source: scriptName
            };
            array.push(routeName);
        }
        return array;
    }, []);
};