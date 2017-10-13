'use strict';
const FutarAPI = require('futar-api');
const Route = require('../../models/routeModel');

const futar = new FutarAPI({ version: 3 });

module.exports = (routeName) => {
    return futar.search(routeName)
        .then(data => {
            if (!(data && data.entry && data.entry.routeIds && data.entry.routeIds.length > 0)) {
                const err =  new Error('Nincsenek a keresésnek megfelelő viszonylatok.');
                err.name = 'InvalidRouteNameError';
                throw err;
            }
            const routesRef = data.references.routes;
            const routes = data.entry.routeIds.filter(x => routesRef[x].shortName.toLowerCase() === routeName.toLowerCase()).map(routeId => formatRoute(routeId, routesRef));
            if (routes.length < 1) {
                const err =  new Error('Nincsenek a keresésnek megfelelő viszonylatok.');
                err.name = 'InvalidRouteNameError';
                throw err;
            }
            return routes;
        });
};

const formatRoute = (routeId, routesRef) => {
    return new Route(routesRef[routeId].id, routesRef[routeId].shortName, null, routesRef[routeId].type, routesRef[routeId].color);
};