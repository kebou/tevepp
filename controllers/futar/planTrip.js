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
        toName: stop.title,
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
    const options = plan.itineraries.filter(itinerary => itinerary.transitTime).map(itinerary => formatItinerary(itinerary, stops));

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
    // gyalogos részek kiszűrése és formázás
    const legs = itinerary.legs.filter(leg => leg.mode !== 'WALK').map(leg => formatLeg(leg, stops));
    return {
        startTime: itinerary.startTime,
        endTime: itinerary.endTime,
        duration: itinerary.duration,
        walkDistance: Math.round(itinerary.walkDistance),
        legs
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
        intermediateStops: leg.intermediateStops.length
    };
};

// az utazási infók megállóneveit lecseréli az adatbáziból lekérdezettekre
const replaceNames = (tripData, stopNames) => {
    for (let option of tripData.options) {
        for (let leg of option.legs) {
            leg.route.headsign = stopNames[leg.route.headsign];
            leg.from.setName(stopNames[leg.from.name]);
            leg.to.setName(stopNames[leg.to.name]);
        }
    }
    return tripData;
};