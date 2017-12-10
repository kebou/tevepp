'use strict';

class ContextLocation {
    constructor(type, value, tokens) {
        this.type = type;
        this.value = value;
        this.tokens = tokens;
        this.source = undefined;
    }
    get string() {
        return this.toString();
    }
    toString() {
        return this.tokens.reduce((prev, token) => prev.concat(' ' + (token.custom || token.content)), '').trim();
    }
}

module.exports = ContextLocation;