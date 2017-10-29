'use strict';
const compose = require('koa-compose');


class TextProcessor {
    constructor() {
        this.middleware = [];
    }

    use(fn) {
        if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
        this.middleware.push(fn);
        return this;
    }

    process(text, ctx) {
        if (!text) {
            throw new TypeError('first parameter must be a string or object!');
        }
        ctx = ctx || {};
        if (typeof text === 'string') {
            ctx.text = text;
        }
        if (typeof text === 'object') {
            ctx = text;
            text = undefined;
        }
        const fn = compose(this.middleware);
        const context = this.createContext(ctx);
        return fn(context);
    }

    createContext(ctx) {
        const context = Object.assign({}, ctx);
        return context;
    }
}

module.exports = TextProcessor;