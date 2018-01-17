'use strict';

class MapElement {
    constructor(type, value) {
        this.type = type;
        this.value = value;
        this.source = undefined;
        this.partial = false;
        this.scores = [];
    }
    get score() {
        return this.scores.reduce((sum, score) => sum += score.value, 0);
    }
}

module.exports = MapElement;