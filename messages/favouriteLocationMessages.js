'use strict';
const BootBot = require('bootbot');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }

    return {
        firstLocationAdded: require('./favouriteLocation/firstLocationAddedMessage')(bot),
        addFirstLocation: require('./favouriteLocation/addFirstLocationMessage')(bot),
        cancelRemoval: require('./favouriteLocation/cancelRemovalMessage')(bot),
        confirmRemoval: require('./favouriteLocation/confirmRemovalMessage')(bot),
        locationRemoved: require('./favouriteLocation/locationRemovedMessage')(bot),
        editName: require('./favouriteLocation/editNameMessage')(bot),
        editLocation: require('./favouriteLocation/editLocationMessage')(bot),
        newLocation: require('./favouriteLocation/newLocationMessage')(bot),
        newName: require('./favouriteLocation/newNameMessage')(bot),
        invalidLocation: require('./invalidLocationMessage')(bot),
        canceled: require('./favouriteLocation/canceledMessage')(bot),
        maxLocationReached: require('./favouriteLocation/maxLocationReachedMessage')(bot),
        missingName: require('./favouriteLocation/missingNameMessage')(bot),
        approveNewLocation: require('./favouriteLocation/approveNewLocationMessage')(bot),
        chooseFromQuickReplies: require('./chooseFromQuickRepliesMessage')(bot),
        newLocationAdded: require('./favouriteLocation/newLocationAddedMessage')(bot),
        locationList: require('./favouriteLocation/locationListMessage')(bot)
    };

};
