'use strict';
const Pattern = require('../../utils/patterns');
/**
 * In: text
 * Out: routeName
 */
module.exports = (ctx, next) => {
    const pattern = Pattern.routeNameInText();
    const match = ctx.text.match(pattern);
    if (match) {
        ctx.routeName = match[0];
    }
    return next();
};