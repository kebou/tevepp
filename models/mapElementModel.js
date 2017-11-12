'use strict';

class MapElement {
    constructor(type, value) {
        this.type = type;
        this.value = value;
        this.source = undefined;
        this.partial = false;
        this.ranks = [];
    }
    get rank() {
        return this.ranks.reduce((sum, rank) => sum += rank.value, 0);
    }
}

module.exports = MapElement;