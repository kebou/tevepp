'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Buttons = require('../elements/buttons');

const MAX_LOCATION = process.env.FAVOURITE_LOCATION_MAX;

module.exports = (bot) => {
    const locationListMessage = (user) => {
        const elements = _formatElements(user);
        const quickReplies = QR.menu(user);
        const options = { quickReplies };

        return bot.sendGenericTemplate(user.id, elements, options);
    };

    return locationListMessage;
};

const _formatElements = (user) => {
    const elements = user.locations.map(location => _formatElement(user, location));
    if (elements.length < MAX_LOCATION) {
        elements.push(addLocationElement(user));
    }
    return elements;
};

const addLocationElement = (user) => {
    return {
        title: Text.favouriteLocation.addNewLocation(user),
        buttons: [
            Buttons.addLocation(user)
        ]
    };  
};

const _formatElement = (user, location) => {
    return {
        title: location.name,
        subtitle: location.title,
        buttons: [
            Buttons.editLocation(user, location),
            Buttons.removeLocation(user, location)
        ]
    };
};
