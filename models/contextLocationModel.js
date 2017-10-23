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
        return this.tokens.reduce((prev, token) => prev.concat(' ' + token.content), '').trim();
    }
}

module.exports = ContextLocation;

const contextLocation = {
    type: 'location, stop, favourite',
    source: 'sourceModuleName',
    value: 'location specific object',
    tokens: 'tokens of the match',
    string: 'concatenated tokens',
    role: 'start, end',
    confidence: 'the value of confidence'
}