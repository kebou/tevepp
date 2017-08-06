'use strict';
const FutarAPI = require('futar-api');

const futar = new FutarAPI({ version: 3 });

module.exports = (stopId, routeName, duration) => {
    const opts = {
        stopId,
        minutesBefore: 0,
        minutesAfter: duration || 2 * 60,
        onlyDepartures: true
    };
    return futar.arrivalsAndDeparturesForStop(opts)
        .then(data => {
            if (!(data && data.entry && data.entry.stopTimes && data && data.entry && data.entry.stopTimes.length > 0)) {
                return false;
            }
            if (filterDepartures(data, routeName).length > 0) {
                return true;
            }
            return false;
        });
};

const filterDepartures = (data, routeName) => {
    const departures = data.entry.stopTimes;
    return departures.filter(x => {
        const trip = data.references.trips[x.tripId];
        const route = data.references.routes[trip.routeId];
        return route.shortName.toLowerCase() === routeName.toLowerCase();
    });
};