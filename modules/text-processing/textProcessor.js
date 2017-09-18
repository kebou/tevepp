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
        const fn = compose(this.middleware);
        const context = this.createContext(text, ctx);
        return fn(context);
    }

    createContext(text, ctx) {
        const context = Object.assign({}, ctx);
        context.text = text;
        return context;
    }
}

module.exports = TextProcessor;