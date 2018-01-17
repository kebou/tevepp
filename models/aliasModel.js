'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AliasSchema = new Schema({
    value: {
        type: String,
        required: [true, 'Alias value is missing.']
    },
    alternatives: [{
        name: {
            type: String,
            required: [true, 'Alternative name is missing.']
        },
        pattern: String
    }]
});

module.exports = mongoose.model('Alias', AliasSchema);