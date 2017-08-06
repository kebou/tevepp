'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StopNameSchema = new Schema({
    name: {
        type: String,
        required: [true, 'The name of the stop is missing.'],
        unique: true
    },
    rawName: String,
    shortName: String,
    isOccured: Boolean
});

module.exports = mongoose.model('StopName', StopNameSchema);