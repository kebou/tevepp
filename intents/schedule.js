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

    const sendDeparturesFromNearbyStops = (user, stops, location) => {
        let departureData = [];
        return _getDepartures(stops, departureData)
            .then(() => _createImages(departureData))
            .then(departureData => Message.departures(user, departureData, location));
    };

    const _getDepartures = (stops, departureData) => {
        return stops.reduce((prev, stop) => {
            return prev.then(() => {
                return Futar.departuresFromStop(stop.id)
                    .then(departures => departureData.push(departures));
            });
        }, Promise.resolve());
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
        let directions;
        return bot.sendAction(user.id, 'typing_on')
            .then(() => _findDirections(stopName, routeName))
            .then(res => {
                directions = res;
                return bot.sendAction(user.id, 'typing_off');
            })
            .then(() => _handleDirections(user, directions, stopName, routeName))
            .catch(err => {
                switch (err.name) {
                    case 'InvalidStopNameError':
                        return Message.invalidStopName(user);
                    case 'InvalidRouteNameError':
                        return Message.invalidRouteName(user);
                    default: throw err;
                }
            });
    };

    const _handleDirections = (user, directions, stopName, routeName) => {
        if (directions.length < 1) {
            let stop;
            return Futar.searchStop(stopName)
                .then(res => {
                    stop = res[0];
                    return Futar.searchRoute(routeName);
                })
                .then(res => res[0])
                .then(route => Message.invalidRouteStopPair(user, stop, route));
        }

        if (directions.length < 2) {
            const direction = directions[0];
            return sendNextDeparture(user, direction.stopId, direction.routeIds);
        }

        return Message.selectDirection(user, directions);
    };

    const _findDirections = (stopName, routeName) => {
        let stops;
        return Futar.searchStop(stopName)
            .then(res => {
                stops = res;
                return Futar.searchRoute(routeName);
            })
            // szűrés közös stopId-k alapján
            .then(routes => {
                const routeIds = routes.map(x => x.id);
                return stops.filter(stop => _commonRouteIds(stop, routeIds));
            })
            // járatindulások lekérdezése a megállóból
            .then(res => {
                stops = res;
                const promises = stops.map(stop => Futar.isDepartureFromStop(stop.id, routeName, 70));
                return Promise.all(promises);
            })
            // megállók szűrése indulási idők alapján (ha van indulás x percen belül, akkor jó a megálló)
            .then(res => stops.filter((stop, idx) => res[idx]))
            // irányok lekérdezése
            .then(res => {
                const promises = res.map(stop => Futar.getDirections(stop.id, stop.routeIds));
                return Promise.all(promises);
            })
            // tömb lapítása
            .then(res => res.reduce((a, b) => a.concat(b), []));
    };

    const _commonRouteIds = (stop, routeIds) => {
        const common = intersect(stop.routeIds, routeIds);
        stop.routeIds = common;
        return common.length;
    };




    return {
        sendDeparturesFromNearbyStops,
        sendDeparturesFromUserSearch,
        sendNextDeparture,
        sendMoreDepartures
    };
};
