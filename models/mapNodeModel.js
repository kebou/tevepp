'use strict';

class MapNode {
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
    setFromContext (ctx) {
        const { elements, role } = ctx;
        this.elements = elements;
        this.role = role;
    }
}

module.exports = MapNode;