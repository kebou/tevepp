'use strict';

class mapElement {
    constructor(type, value) {
        this.type = type;
        this.value = value;
        this.source = undefined;
        this.partial = false;
        this.rank = 0;
    }
}

module.exports = mapElement;