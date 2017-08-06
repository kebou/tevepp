'use strict';

const StopName = require('../models/stopNameModel');

const stopNameCache = {};

const getStopNames = module.exports.getStopNames = (names) => {
    if (typeof names === 'undefined') {
        const err = new Error('A keresendő nevek megadása kötelező!');
        err.name = 'InvalidArgumentError';
        throw err;
    }

    if (typeof names === 'string') {
        names = [names];
    }

    const { cached, notCached } = getCache(names);

    if (notCached.length === 0) {
        return Promise.resolve(cached);
    }

    return StopName.find({}).where('name').in(notCached).exec()
        .then(stopsFromDb => {
            stopsFromDb = new Set(stopsFromDb.map(setCache));
            return notCached.filter(x => !stopsFromDb.has(x));
        })
        .then(stopsToInsert => {
            if (stopsToInsert.length === 0) {
                return getStopNames(names);
            }

            stopsToInsert = stopsToInsert.map(generateStopNames);
            return StopName.create(stopsToInsert)
                .then(insertedStops => {
                    insertedStops.map(setCache);
                    return getStopNames(names);
                });
        });

};

const getCache = (names) => {
    const cached = {};
    const notCached = [];
    for (let name of names) {
        if (stopNameCache.hasOwnProperty(name))
            cached[name] = stopNameCache[name];
        else notCached.push(name);
    }
    return { cached, notCached };
};

const setCache = (stopName) => {
    if (!stopNameCache.hasOwnProperty(stopName.name)) {
        const { name, rawName, shortName } = stopName;
        stopNameCache[stopName.name] = { 
            name,
            rawName,
            shortName: shortName || (rawName && rawName.slice(0,19) + '.') || null
        };
    }
    return stopName.name;
};

const generateStopNames = (name) => {
    return {
        name,
        rawName: generateRawName(name),
        shortName: generateShortName(name),
        isOccured: true
    };
};

const generateRawName = (stopName) => {
    let name = stopName;
    name = name.replace(/ M$| H$| \(».+\)| M\+H/, '');
    name = name.replace(/ H | M /, ' ');
    name = name.replace(/ M\)| H\)/, ')');
    return name;
};

const generateShortName = (stopName) => {
    if (stopName.length <= 20) {
        return stopName;
    }
    let shortName = '';
    // rövidítő metódusok
    shortName = stopName.replace(/utca/g, 'u.');
    shortName = shortName.replace(/lakótelep/g, 'ltp.');
    shortName = shortName.replace(/vasútállomás/g, 'vá.');

    if (shortName !== '' && shortName.length <= 20) {
        return shortName;
    }

    return null;
};