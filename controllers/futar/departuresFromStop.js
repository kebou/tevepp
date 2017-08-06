'use strict';
const FutarAPI = require('futar-api');
const stopController = require('../stopController');
const Stop = require('../../models/stopModel');
const Route = require('../../models/routeModel');
const intersect = require('../../utils/intersect');

const futar = new FutarAPI({ version: 3 });

module.exports = (stopId, routeId) => {
    const opts = {
        stopId,
        minutesBefore: 0,
        minutesAfter: 2 * 60,
        onlyDepartures: true
    };
    let departureData;
    return futar.arrivalsAndDeparturesForStop(opts)
        .then(data => {
            if (!(data && data.entry && data.entry.stopTimes)) {
                throw new Error('Nincsenek indulási információk.');
            }
            return formatData(data, routeId);
        })
        .then(({ data, stops }) => {
            departureData = data;
            return stopController.getStopNames(stops);
        })
        .then(stopNames => replaceNames(departureData, stopNames));
};

const formatData = (data, routeId) => {
    const stopId = data.entry.stopId;
    const stop = data.references.stops[stopId];
    let stops = new Set();
    stops.add(stop.name);
    let departures = data.entry.stopTimes.map(departure => formatDeparture(departure, data.references, stops));
    // szűrés csak egy járatra, ha a viszonylat kódja adott
    if (typeof routeId === 'string') {
        departures = departures.filter(departure => (departure.route.id === routeId));
    }
    // szűrés csak egy járatra, ha több viszonylat kódja adott egy tömbben
    if (Array.isArray(routeId)) {
        departures = departures.filter(departure => intersect([departure.route.id], routeId).length > 0);
    }

    return {
        data: {
            stop: new Stop(stopId, stop.name, stop.lat, stop.lon),
            departures
        },
        stops
    };
};

const formatDeparture = (departure, references, stops) => {   
    const trip = references.trips[departure.tripId];
    const route = references.routes[trip.routeId];

    stops.add(trip.tripHeadsign);

    return {
        route: new Route(route.id, route.shortName, trip.tripHeadsign, route.type, route.color),
        timestamp: (departure.predictedArrivalTime || departure.arrivalTime || departure.predictedDepartureTime || departure.departureTime) * 1000
    };
};

const replaceNames = (data, stopNames) => {
    data.stop.setName(stopNames[data.stop.name]);
    for (let departure of data.departures) {
        departure.route.headsign = stopNames[departure.route.headsign];
    }
    return data;
};