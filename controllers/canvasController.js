'use strict';
const TripSummaryCanvas = require('../canvases/tripSummaryCanvas');
const TripDetailsCanvas = require('../canvases/tripDetailsCanvas');
const DeparturesCanvas = require('../canvases/departuresCanvas');
const Image = require('../models/imageModel');

module.exports.tripSummary = (legs) => {
    return TripSummaryCanvas(legs)
        .then(buffer => new Image({ contentType: 'png', data: buffer, type: 'plan' }).save())
        .then(img => img.id);
};

module.exports.tripDetails = (leg) => {
    return TripDetailsCanvas(leg)
        .then(buffer => new Image({ contentType: 'png', data: buffer, type: 'tripDetails' }).save())
        .then(img => img.id);
};

module.exports.departures = (departures) => {
    return DeparturesCanvas(departures)
        .then(buffer => new Image({ contentType: 'png', data: buffer, type: 'departures' }).save())
        .then(img => img.id);
};