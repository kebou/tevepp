'use strict';

class MapObject {
    constructor(tokens) {
        this.tokens = tokens;
        this.elements = [];
        this.role = undefined;
    }
    get rank() {
        if (this.elements.length < 1) {
            return 0;
        }
        return this.elements.reduce((sum, element) => sum += element.rank, 0);
    }
    get string() {
        return this.toString();
    }
    toString() {
        return this.tokens.reduce((prev, token) => prev.concat(' ' + (token.custom || token.content)), '').trim();
    }
}

module.exports = MapObject;