'use strict';

module.exports = (schema) => {
    schema.add({
        updatedAt: { type: Date, default: Date.now }
    });

    schema.pre('update', function () {
        this.update({}, {
            $set: { updatedAt: new Date() }
        });
    });
};