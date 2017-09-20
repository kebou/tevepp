'use strict';

const Location = require('../models/locationModel');
const mongoose = require('mongoose');
const NodeGeocoder = require('../utils/node-geocoder');
const tryParseJSON = require('../utils/tryparse-json');
const config = require('config');

const mapOpts = {
    provider: 'google',
    language: 'hu',
    apiKey: process.env.MAPS_API_KEY || config.get('mapsApiKey'),
    formatter: null,
    bounds: '47.1523107,18.8460594|47.6837053,19.3915303'
};

const gc = NodeGeocoder(mapOpts);

const fromPayload = (payload) => {
    const userId = payload.sender.id;
    const text = payload.message && payload.message.text;
    const attachments = payload.message && payload.message.attachments;
    const { type, data } = payload.message.quick_reply && payload.message.quick_reply.payload && tryParseJSON(payload.message.quick_reply.payload) || false;

    if (!text && !(attachments && attachments[0] && (attachments[0].type === 'location')) && !(type && (type === 'LOCATION'))) {
        return Promise.reject(new Error('Payload doesn\'t contain location attachment or text.'));
    }

    if (type === 'LOCATION')
        return fromQuickReply(data, userId);

    if (attachments && attachments[0].type === 'location')
        return fromAttachment(attachments[0], userId);

    return fromText(text, userId);

};

const fromAttachment = (attachment, userId) => {
    const coords = { lat: attachment.payload.coordinates.lat, lon: attachment.payload.coordinates.long };

    return gc.reverse(coords)
        .then(res => {
            const params = _formatParams(res[0]);
            params.fbTitle = attachment.title;

            const loc = new Location(params);
            const locObj = loc.toObject();

            loc.userId = userId;
            loc.type = 'log';
            loc.source = 'locationPicker';
            loc.save();

            return locObj;
        })
        .catch(() => {
            const params = {
                title: attachment.title,
                fbTitle: attachment.title,
                latitude: coords.lat,
                longitude: coords.lon
            };

            const loc = new Location(params);
            const locObj = loc.toObject();

            loc.userId = userId;
            loc.type = 'log';
            loc.source = 'locationPicker';
            loc.save();

            return locObj;
        });
};

const fromQuickReply = (data, userId) => {
    return new Promise(resolve => {
        delete data.location._id;
        const loc = new Location(data.location);
        const locObj = loc.toObject();

        loc.userId = userId;
        loc.type = 'log';
        loc.source = 'favourites';
        loc.save();

        return resolve(locObj);
    });
};

const fromText = (text, userId) => {
    return gc.geocode({ text: text, withBounds: true })
        .then(res => {
            if (res.length < 1) {
                const err = new Error('Geocoder result is empty.');
                err.name = 'LocationError';
                throw err;
            }

            const params = _formatParams(res[0]);

            const loc = new Location(params);
            const locObj = loc.toObject();

            loc.userId = userId;
            loc.type = 'log';
            loc.source = 'text';
            loc.save();

            return locObj;
        });
};

const fromStop = (stop, userId) => {
    return new Promise(resolve => {
        const params = {
            title: stop.rawName,
            latitude: stop.latitude,
            longitude: stop.longitude
        };
        const loc = Location(params);
        const locObj = loc.toObject();
    
        loc.userId = userId;
        loc.type = 'log';
        loc.source = 'stop';
        loc.save();
    
        return resolve(locObj);
    });
};

const saveFavourite = (user, location, update) => {
    location.userId = user.id;
    location.type = 'favourite';
    if (!location._id) {
        location._id = mongoose.mongo.ObjectID();
    }

    const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
    };
    return Location.findByIdAndUpdate(location._id, location, options).exec()
        .then(loc => {
            if (update) {
                return user;
            }
            user.locations.push(loc);
            return user.save();
        });
};

const removeFavourite = (user, location) => {
    return Location.findByIdAndRemove(location._id)
        .then(() => user.locations.remove(location._id));
};

const toMapUrl = (location, type) => {
    const mode = type || 'WALK';
    let transport = '';
    switch (mode) {
        case 'WALK': transport = 'w'; break;
        case 'DRIVE': transport = 'd'; break;
        case 'TRANSIT': transport = 'r'; break;
    }
    const url = 'http://maps.apple.com/?t=m';
    return url + `&daddr=${location.latitude},${location.longitude}&dirflg=${transport}`;
};

const toGoogleMapsUrl = (location, type) => {
    const mode = type || 'WALK';
    let travelmode = '';
    switch (mode) {
        case 'WALK': travelmode = 'walking'; break;
        case 'DRIVE': travelmode = 'driving'; break;
        case 'TRANSIT': travelmode = 'transit'; break;
        case 'CYCLING': travelmode = 'bicycling'; break;
    }
    const url = 'https://www.google.com/maps/dir/?api=1';
    return url + `&destination=${location.latitude},${location.longitude}&travelmode=${travelmode}`;
};

const _formatTitle = (res) => {
    let title = '';
    if (res.city) title += res.city;
    if (res.streetName) title += `, ${res.streetName}`;
    if (res.streetNumber) title += ` ${res.streetNumber}.`;
    if (!res.streetName && res.extra && res.extra.neighborhood) {
        title += `, ${res.extra.neighborhood}`;
    }
    return title;
};

const _formatParams = (res) => {
    const params = {
        title: _formatTitle(res),
        latitude: res.latitude,
        longitude: res.longitude,
        city: res.city,
        streetName: res.streetName,
        streetNumber: res.streetNumber,
        zipCode: res.zipcode
    };
    return params;
};

module.exports = {
    fromText,
    fromPayload,
    fromAttachment,
    fromQuickReply,
    fromStop,
    saveFavourite,
    removeFavourite,
    toMapUrl
};