'use strict';

module.exports = (schema) => {
    schema.add({
        createdAt: { type: Date, default: Date.now, expires: '4h' }
    });
};