'use strict';
const FutarAPI = require('futar-api');
const stopController = require('../stopController');
const Stop = require('../../models/stopModel');

const futar = new FutarAPI({ version: 3 });

module.exports = (location) => {
    const opts = {
        lat: location.latitude,
        lon: location.longitude,
        radius: 60
    };
    let stopNames = new Set();
    let stops;
    return futar.stopsForLocation(opts)
        .then(data => {
            if (!(data && data.list)) {
                throw new Error('Nincsenek közeli megállók.');
            }
            return data.list.map(stop => {
                stopNames.add(stop.name);
                return formatStop(stop);
            });
        })
        .then(stopData => {
            stops = stopData;
            return stopController.getStopNames(stopNames);
        })
        .then(stopNames => replaceNames(stops, stopNames));
};

const formatStop = (stop) => {
    return new Stop(stop.id, stop.name, stop.lat, stop.lon);
};

const replaceNames = (stops, stopNames) => {
    for (let stop of stops) {
        stop.setName(stopNames[stop.name]); 
    }
    return stops;
};