'use strict';
const FutarAPI = require('futar-api');
const stopController = require('../stopController');
const Location = require('../../models/locationModel');
const Stop = require('../../models/stopModel');
const Route = require('../../models/routeModel');

const futar = new FutarAPI({ version: 3 });


module.exports = (start, stop) => {
    const opts = {
        fromName: start.title,
        fromLat: start.latitude,
        fromLon: start.longitude,
        toName: stop.shortTitle,
        toLat: stop.latitude,
        toLon: stop.longitude,
        maxTransfers: 4
    };
    let summary;
    return futar.planTrip(opts)
        .then(data => {
            if (!(data && data.entry && data.entry.plan)) {
                throw new Error('Nincsenek tervezési információk.');
            }
            return formatData(data.entry.plan);
        })
        .then(({ tripData, stops }) => {
            summary = tripData;
            return stopController.getStopNames(stops);
        })
        .then(stopNames => replaceNames(summary, stopNames));
};

const formatData = (plan) => {
    let stops = new Set();
    // tömegközlekedés nélküli lehetőségek kiszűrése és formázás
    const options = plan.itineraries
        .filter(itinerary => itinerary.transitTime)
        .map(itinerary => formatItinerary(itinerary, stops));

    const tripData = {
        from: new Location({
            title: plan.from.name,
            latitude: plan.from.lat,
            longitude: plan.from.lon
        }).toObject(),
        to: new Location({
            title: plan.to.name,
            latitude: plan.to.lat,
            longitude: plan.to.lon
        }).toObject(),
        options
    };

    return { tripData, stops };
};

const formatItinerary = (itinerary, stops) => {
    // gyalogos részek kiszűrése a kezdeti és a végső sétán kívül és formázás
    const legs = itinerary.legs
        .filter((leg, idx) => leg.mode !== 'WALK' || (leg.mode === 'WALK' && idx === itinerary.legs.length - 1))
        .map(leg => {
            if (leg.mode === 'WALK') {
                return formatWalkLeg(leg);
            }
            return formatLeg(leg, stops);
        });
    return {
        startTime: itinerary.startTime,
        endTime: itinerary.endTime,
        duration: itinerary.duration,
        walkDistance: Math.round(itinerary.walkDistance),
        legs
    };
};

const formatWalkLeg = (leg) => {
    return {
        from: new Location({
            title: leg.from.name,
            latitude: leg.from.lat,
            longitude: leg.from.lon
        }),
        to: new Location({
            title: leg.to.name,
            latitude: leg.to.lat,
            longitude: leg.to.lon
        }),
        duration: leg.duration,
        distance: leg.distance,
        startTime: leg.startTime,
        endTime: leg.endTime,
        mode: leg.mode
    };
};

const formatLeg = (leg, stops) => {
    stops.add(leg.headsign);
    stops.add(leg.from.name);
    stops.add(leg.to.name);

    return {
        from: new Stop(leg.from.stopId, leg.from.name, leg.from.lat, leg.from.lon),
        to: new Stop(leg.to.stopId, leg.to.name, leg.to.lat, leg.to.lon),
        route: new Route(leg.routeId, leg.route, leg.headsign, leg.mode, leg.routeColor),
        duration: leg.duration,
        startTime: leg.startTime,
        endTime: leg.endTime,
        intermediateStops: leg.intermediateStops.length,
        mode: leg.mode
    };
};

// az utazási infók megállóneveit lecseréli az adatbáziból lekérdezettekre
const replaceNames = (tripData, stopNames) => {
    for (let option of tripData.options) {
        for (let leg of option.legs) {
            if (leg.mode === 'WALK') continue;
            leg.route.headsign = stopNames[leg.route.headsign];
            leg.from.setName(stopNames[leg.from.name]);
            leg.to.setName(stopNames[leg.to.name]);
        }
    }
    return tripData;
};