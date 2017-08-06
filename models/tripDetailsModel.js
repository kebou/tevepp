'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TripDetailsSchema = new Schema({
    duration: Number,
    startTime: Number,
    endTime: Number,
    walkDistance: Number,
    legs: [{
        from: Object,
        to: Object,
        route: Object,
        duration: Number,
        startTime: Number,
        endTime: Number,
        intermediateStops: Number
    }],
    createdAt: { type: Date, default: Date.now, expires: '5d' }
});

module.exports = mongoose.model('TripDetails', TripDetailsSchema);