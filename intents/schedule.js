'use strict';
const BootBot = require('bootbot');
const Futar = require('../controllers/futarController');
const intersect = require('../utils/intersect');

const Canvas = require('../controllers/canvasController');


module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }
    const Message = require('../messages/scheduleMessages')(bot);

    const sendDeparturesFromStops = (user, stops, location) => {

    };

    const sendDeparturesFromNearbyStops = (user, stops, location) => {
        return _getDepartures(stops)
            .then(departureData => _filterDepartures(departureData))
            .then(departureData => _createImages(departureData))
            .then(departureData => Message.departures(user, departureData, location));
    };

    const _getDepartures = (stops) => {
        const promises = stops.map(stop => Futar.departuresFromStop(stop.id));
        return Promise.all(promises);
    };

    const _filterDepartures = (departureData) => {
        return departureData.filter(x => x.departures.length > 0);
    };

    const _createImages = (departureData) => {
        const promises = departureData.map(data => Canvas.departures(data.departures));
        return Promise.all(promises)
            .then(imgIds => {
                for (let i in imgIds) {
                    departureData[i].imageId = imgIds[i];
                }
                return departureData;
            });
    };

    const sendMoreDepartures = (user, stopId, routeIds) => {
        return Futar.departuresFromStop(stopId, routeIds)
            .then(res => _createImages([res]))
            .then(res => Message.departures(user, res));
    };

    const sendNextDeparture = (user, stopId, routeIds) => {
        return Futar.departuresFromStop(stopId, routeIds)
            .then(res => Message.nextDeparture(user, res, routeIds));
    };

    const sendDeparturesFromUserSearch = (user, stopName, routeName) => {
        return bot.sendAction(user.id, 'typing_on')
            .then(() => _findDirections(stopName, routeName))
            .then(directions => _handleDirections(user, directions, stopName, routeName))
            .catch(err => _handleError(user, err));
    };

    const _findDirections = (stopName, routeName) => {
        let stops;
        return Futar.searchStop(stopName)
            .then(res => {
                stops = res;
                return Futar.searchRoute(routeName);
            })
            .then(routes => _filterStopsByRouteIds(stops, routes))
            .then(stops => _filterStopsByDepartureData(stops, routeName))
            .then(stops => _getDirections(stops))
            .then(stops => _flattenArray(stops));
    };

    // szűrés közös stopId-k alapján
    const _filterStopsByRouteIds = (stops, routes) => {
        const routeIds = routes.map(x => x.id);
        
        return stops.filter(stop => {
            const common = intersect(stop.routeIds, routeIds);
            stop.routeIds = common;
            return common.length;
        });
    };

    // megállók szűrése indulási idők alapján (ha van indulás x percen belül, akkor jó a megálló)
    const _filterStopsByDepartureData = (stops, routeName) => {
        const promises = stops.map(stop => Futar.isDepartureFromStop(stop.id, routeName, 70));
        return Promise.all(promises)
            .then(isDeparture => stops.filter((stop, idx) => isDeparture[idx]));
    };

    // irányok lekérdezése
    const _getDirections = (stops) => {
        const promises = stops.map(stop => Futar.getDirections(stop.id, stop.routeIds));
        return Promise.all(promises);
    };

    // tömb lapítása
    const _flattenArray = (stops) => {
        return stops.reduce((a, b) => a.concat(b), []);
    };

    const _handleDirections = (user, directions, stopName, routeName) => {
        if (directions.length < 1) {
            return _handleNoDirection(user, stopName, routeName);
        }
        if (directions.length < 2) {
            const direction = directions[0];
            return sendNextDeparture(user, direction.stopId, direction.routeIds);
        }
        return Message.selectDirection(user, directions);
    };

    const _handleNoDirection = (user, stopName, routeName) => {
        let stop;
        return Futar.searchStop(stopName)
            .then(res => {
                stop = res[0];
                return Futar.searchRoute(routeName);
            })
            .then(res => res[0])
            .then(route => {
                if (user.searchRetried) {
                    const err = new Error('Nincsenek a keresésnek megfelelő megálló-járat párok.');
                    err.name = 'NoDirectionsError';
                    err.stopName = stop;
                    err.routeName = route;
                    throw err;
                }
                user.searchRetried = true;
                return sendDeparturesFromUserSearch(user, stop.rawName, route.name);
            });
    };

    const _handleError = (user, err) => {
        switch (err.name) {
            case 'InvalidStopNameError':
                return Message.invalidStopName(user);
            case 'InvalidRouteNameError':
                return Message.invalidRouteName(user);
            case 'NoDirectionsError':
                return Message.invalidRouteStopPair(user, err.stopName, err.routeName);
            default: throw err;
        }
    };


    return {
        sendDeparturesFromNearbyStops,
        sendDeparturesFromUserSearch,
        sendNextDeparture,
        sendMoreDepartures
    };
};
