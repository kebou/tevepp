'use strict';

class Route {
    constructor(id, name, headsign, type, color) {
        this.id = id;
        this.name = name;
        this.headsign = headsign;
        this.type = type;
        this.color = color;
    }
    get code() {
        return this.id.split('_')[1];
    }
    set code(code) {
        this.id = 'BKK_' + code;
    }
}

module.exports = Route;