'use strict';

module.exports.yes = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.yes'),
        image_url: 'http://i.imgur.com/K3GUcFB.png',
        payload: 'YES'
    };
};

module.exports.no = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.no'),
        image_url: 'http://i.imgur.com/Ojwlcn1.png',
        payload: 'NO'
    };
};

module.exports.cancel = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.cancel'),
        image_url: 'http://i.imgur.com/Ojwlcn1.png',
        payload: 'CANCEL'
    };
};

const help = module.exports.help = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.help'),
        image_url: 'http://i.imgur.com/MUpaSKv.png',
        payload: 'HELP'
    };
};

const planTrip = module.exports.planTrip = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.planTrip'),
        image_url: 'http://i.imgur.com/pmkpQJV.png',
        payload: 'PLAN_TRIP'
    };
};

module.exports.planFromHere = (user, location) => {
    return {
        content_type: 'text',
        title: user.__('button.planFromHere'),
        payload: JSON.stringify({
            type: 'PLAN_FROM_HERE',
            data: {
                location
            }
        })
    };
};

module.exports.planToHere = (user, location) => {
    return {
        content_type: 'text',
        title: user.__('button.planToHere'),
        payload: JSON.stringify({
            type: 'PLAN_TO_HERE',
            data: {
                location
            }
        })
    };
};

const location = module.exports.location = () => {
    return {
        content_type: 'location'
    };
};

const favouriteLocation = module.exports.favouriteLocation = (location) => {
    return {
        content_type: 'text',
        title: location.name,
        image_url: 'http://i.imgur.com/UL4dp6s.png',
        payload: JSON.stringify({
            type: 'LOCATION',
            data: {
                location
            }
        })
    };
};

const favourites = module.exports.favourites = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.favourites'),
        image_url: 'http://i.imgur.com/UL4dp6s.png',
        payload: 'FAVOURITES'
    };
};

module.exports.direction = (direction) => {
    return {
        content_type: 'text',
        title: direction.headsign.shortName,
        payload: JSON.stringify({
            type: 'DIRECTION',
            data: {
                stopId: direction.stopId,
                routeIds: direction.routeIds
            }
        })
    };
};

module.exports.moreDepartures = (user, stopId, routeIds) => {
    return {
        content_type: 'text',
        title: user.__('button.moreDepartures'),
        payload: JSON.stringify({
            type: 'MORE_DEPARTURES',
            data: {
                stopId,
                routeIds
            }
        })
    };
};

module.exports.editName = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.editName'),
        image_url: 'http://i.imgur.com/bZN6JJ7.png',
        payload: 'EDIT_NAME'
    };
};

module.exports.editLocation = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.editLocation'),
        image_url: 'http://i.imgur.com/bZN6JJ7.png',
        payload: 'EDIT_LOCATION'
    };
};

module.exports.dontModify = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.dontModify'),
        payload: 'DONT_MODIFY'
    };
};

module.exports.sendFeedback = (user) => {
    return {
        content_type: 'text',
        title: user.__('button.sendFeedback'),
        image_url: 'http://i.imgur.com/iBgza79.png',
        payload: 'SEND_FEEDBACK'
    };
};

/**
 * Quick Reply menü összeállítása
 * @param {object} user a felhasználót reprezentáló objektum
 */
module.exports.menu = (user) => {
    return [planTrip(user), help(user)];
};

/**
 * Kedvenc helyek összeállítása
 * @param {object} user a felhasználót reprezentáló objektum
 */
module.exports.favouriteLocations = (user) => {
    const locations = user.locations.map(favouriteLocation);
    if (locations.length < 1) {
        return [favourites(user)];
    }
    return locations;
};