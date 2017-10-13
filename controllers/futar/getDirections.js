'use strict';
const FutarAPI = require('futar-api');
const stopController = require('../stopController');

const futar = new FutarAPI({ version: 3 });

const getDirections = (stopId, routeIds) => {
    let directionsData;
    return callApi(stopId)
        .then(data => formatDirections(stopId, routeIds, data.list))
        .then(({ data, stopsToFetch }) => {
            directionsData = data;
            return stopController.getStopNames(stopsToFetch);
        })
        .then(stopNames => replaceStopNames(directionsData, stopNames));
};

const callApi = (stopId) => {
    return futar.routeDetailsForStop(stopId)
        .then(data => {
            if (!(data && data.list && data.list.length > 0)) {
                throw new Error('Nincsenek viszonylat információk a megállóhoz.');
            }
            return data;
        });
};

const formatDirections = (stopId, routeIds, routes) => {
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

            if (directions.hasOwnProperty(lastStopId)) {
                directions[lastStopId].routeIds.push(routeId);
                continue;
            }

            const headsign = variant.headsign;
            stopsToFetch.add(headsign);
            directions[lastStopId] = {
                headsign,
                stopId,
                routeIds: [routeId]
            };
        }
    }
    return { data: Object.values(directions), stopsToFetch };
};

const replaceStopNames = (directions, stopNames) => {
    for (let direction of directions) {
        direction.headsign = stopNames[direction.headsign];
    }
    return directions;
};

module.exports = getDirections;