'use strict';
const locationController = require('../../controllers/locationController');

module.exports.planFromHere = (user, location) => {
    return {
        type: 'postback',
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
        type: 'postback',
        title: user.__('button.planToHere'),
        payload: JSON.stringify({
            type: 'PLAN_TO_HERE',
            data: {
                location
            }
        })
    };
};

module.exports.mapForWalk = (user, location) => {
    return {
        type: 'web_url',
        title: user.__('button.goToStop'),
        url: locationController.toMapUrl(location)
    };
};

module.exports.tripDetails = (user, option) => {
    return {
        type: 'postback',
        title: user.__('button.details'),
        payload: JSON.stringify({
            type: 'TRIP_DETAILS',
            data: {
                tripDetailsId: option._id
            }
        })
    };
};

// module.exports.tripDetails = (user, legs) => {
//     return {
//         type: 'web_url',
//         title: user.__('button.details'),
//         url: 'http://futar.bkk.hu/trip-plan'
//         // payload: JSON.stringify({
//         //     type: 'TRIP_DETAILS',
//         //     data: legs
//         // })
//     };
// };

module.exports.editLocation = (user, location) => {
    return {
        type: 'postback',
        title: user.__('button.edit'),
        payload: JSON.stringify({
            type: 'EDIT_LOCATION',
            data: {
                location
            }
        })
    };
};

module.exports.removeLocation = (user, location) => {
    return {
        type: 'postback',
        title: user.__('button.remove'),
        payload: JSON.stringify({
            type: 'REMOVE_LOCATION',
            data: {
                location
            }
        })
    };
};

module.exports.addLocation = (user) => {
    return {
        type: 'postback',
        title: user.__('button.add'),
        payload: 'ADD_LOCATION'
    };
};