'use strict';
const FutarAPI = require('futar-api');
const stopController = require('../stopController');

const futar = new FutarAPI({ version: 3 });

module.exports = (stopId, routeIds) => {
    let directions;
    return futar.routeDetailsForStop(stopId)
        .then(data => {
            if (!(data && data.list && data.list.length > 0)) {
                throw new Error('Nincsenek viszonylat információk a megállóhoz.');
            }
            return getDirections(stopId, routeIds, data.list);
        })
        .then(({ data, stops }) => {
            directions = data;
            return stopController.getStopNames(stops);
        })
        .then(stopNames => replaceNames(directions, stopNames));
};

const getDirections = (stopId, routeIds, routes) => {
    const directions = {};
    let stopsToFetch = new Set();
    for (let routeId of routeIds) {
        const route = routes.find(x => x.id === routeId);
        for (let variant of route.variants) {
            // továbblépés, ha a variant nem tartalmazza a stopId-t
            if (variant.stopIds.find(x => x === stopId) === undefined) {
                continue;
            }
            // továbblépés, ha a variant végállomása egyezik a keresett megállóval
            const lastStopId = variant.stopIds[variant.stopIds.length - 1];
            if (stopId === lastStopId) {
                continue;
            }

            const headsign = variant.headsign;
            if (directions.hasOwnProperty(headsign)) {
                directions[variant.headsign].routeIds.push(routeId);
                continue;
            }

            stopsToFetch.add(headsign);
            directions[headsign] = {
                headsign,
                stopId,
                routeIds: [routeId]
            };
        }
    }
    return { data: Object.values(directions), stops: stopsToFetch };
};

const replaceNames = (directions, stopNames) => {
    for (let direction of directions) {
        direction.headsign = stopNames[direction.headsign];
    }
    return directions;
};