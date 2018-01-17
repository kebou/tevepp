'use strict';

class MapNode {
    constructor(tokens) {
        this.tokens = tokens;
        this.elements = [];
        this.scores = [];
    }
    get bestElement () {
        if (this.elements.length < 1) {
            return undefined;
        }
        let max = this.elements[0];
        for (let element of this.elements) {
            if (max.score < element.score) {
                max = element;
            }
        }
        return max;
    }
    get score() {
        if (this.elements.length < 1) {
            return -10000;
        }
        const score = this.scores.reduce((sum, score) => sum += score.value, 0);
        return score + this.bestElement.score;
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
            score: this.score,
            scores: this.scores,
            role: this.role,
            bestElement: this.bestElement
        };
    }
}

module.exports = MapNode;