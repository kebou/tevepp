'use strict';

class Stop {
    constructor(id, name, latitude, longitude) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.setName(name);
    }
    get code() {
        return this.id.split('_')[1];
    }
    set code(code) {
        this.id = 'BKK_' + code;
    }
    setName (name) {
        if (typeof name === 'string') name = { name };
        Object.assign(this, name);
    }
}

module.exports = Stop;