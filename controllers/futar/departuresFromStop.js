'use strict';
const FutarAPI = require('futar-api');
const stopController = require('../stopController');
const Stop = require('../../models/stopModel');
const Route = require('../../models/routeModel');
const intersect = require('../../utils/intersect');

const futar = new FutarAPI({ version: 3 });

const departuresFromStop = (stopId, routeId) => {
    let departuresData;
    return callApi(stopId)
        .then(data => formatData(data, routeId))
        .then(({ data, stopsToFetch }) => {
            departuresData = data;
            return stopController.getStopNames(stopsToFetch);
        })
        .then(stopNames => replaceStopNames(departuresData, stopNames));
};

const callApi = (stopId) => {
    const opts = {
        stopId,
        minutesBefore: 0,
        minutesAfter: 2 * 60,
        onlyDepartures: true
    };
    return futar.arrivalsAndDeparturesForStop(opts)
        .then(data => {
            if (!(data && data.entry && data.entry.stopTimes)) {
                throw new Error('Nincsenek indulási információk.');
            }
            return data;
        });
};

const formatData = (data, routeId) => {
    const stopId = data.entry.stopId;
    const stop = data.references.stops[stopId];
    let stopsToFetch = new Set();
    let departures;
    stopsToFetch.add(stop.name);

    departures = formatDepartures(data, stopsToFetch);
    departures = filterDeparturesByRouteId(departures, routeId);

    return {
        data: {
            stop: new Stop(stopId, stop.name, stop.lat, stop.lon),
            departures
        },
        stopsToFetch
    };
};

const filterDeparturesByRouteId = (departures, routeId) => {
    // szűrés csak egy járatra, ha a viszonylat kódja adott
    if (typeof routeId === 'string') {
        return departures.filter(departure => (departure.route.id === routeId));    
    }
    // szűrés csak egy járatra, ha több viszonylat kódja adott egy tömbben
    if (Array.isArray(routeId)) {
        return departures.filter(departure => intersect([departure.route.id], routeId).length > 0);
    }
    return departures;
};

const formatDepartures = (data, stops) => {
    return data && data.entry && data.entry.stopTimes && data.entry.stopTimes.map(departure => {
        const trip = data.references && data.references.trips && data.references.trips[departure.tripId];
        const route = data.references && data.references.routes && data.references.routes[trip.routeId];

        stops.add(trip.tripHeadsign);
        return {
            route: new Route(route.id, route.shortName, trip.tripHeadsign, route.type, route.color),
            timestamp: (departure.predictedArrivalTime || departure.arrivalTime || departure.predictedDepartureTime || departure.departureTime) * 1000
        };
    });
};

const replaceStopNames = (data, stopNames) => {
    data.stop.setName(stopNames[data.stop.name]);
    for (let departure of data.departures) {
        departure.route.headsign = stopNames[departure.route.headsign];
    }
    return data;
};

module.exports = departuresFromStop;