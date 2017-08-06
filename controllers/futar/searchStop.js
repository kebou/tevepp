'use strict';
const FutarAPI = require('futar-api');
const Stop = require('../../models/stopModel');
const stopController = require('../stopController');

const futar = new FutarAPI({ version: 3 });

module.exports = (stopName) => {
    let stops;
    return futar.search(stopName)
        .then(data => {
            if (!(data && data.entry && data.entry.stopIds && data.entry.stopIds.length > 0)) {
                const err = new Error('Nincsenek a keresésnek megfelelő megállók.');
                err.name = 'InvalidStopNameError';
                throw err;
            }
            const stopsRef = data.references.stops;
            return data.entry.stopIds.map(stopId => formatStop(stopId, stopsRef));
        })
        .then(data => {
            stops = data;
            // lekérdezendő megállók összeállítása
            const stopsToFetch = new Set(stops.map(stop => stop.name));
            return stopController.getStopNames(stopsToFetch);
        })
        .then(stopNames => replaceNames(stops, stopNames));
};

const formatStop = (stopId, stopsRef) => {
    const stop = new Stop(stopId, stopsRef[stopId].name, stopsRef[stopId].lat, stopsRef[stopId].lon);
    stop.routeIds = stopsRef[stopId].routeIds;
    return stop;
};

const replaceNames = (stops, stopNames) => {
    for (let stop of stops) {
        stop.setName(stopNames[stop.name]);
    }
    return stops;
};