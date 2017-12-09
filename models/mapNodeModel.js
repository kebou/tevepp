'use strict';

class MapNode {
    constructor(tokens) {
        this.tokens = tokens;
        this.elements = [];
        this.ranks = [];
    }
    get bestElement () {
        if (this.elements.length < 1) {
            return undefined;
        }
        let max = this.elements[0];
        for (let element of this.elements) {
            if (max.rank < element.rank) {
                max = element;
            }
        }
        return max;
    }
    get rank() {
        if (this.elements.length < 1) {
            return -10000;
        }
        const rank = this.ranks.reduce((sum, rank) => sum += rank.value, 0);
        return rank + this.bestElement.rank;
    }
    get text() {
        return this.toString();
    }
    toString() {
        return this.tokens.reduce((prev, token) => prev.concat(' ' + (token.custom || token.content)), '').trim();
    }
    toJSON() {
        return {
            tokens: this.tokens,
            elements: this.elements,
            score: this.rank,
            scores: this.ranks,
            role: this.role,
            bestElement: this.bestElement
        };
    }
}

module.exports = MapNode;