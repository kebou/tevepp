'use strict';
const BootBot = require('bootbot');
const config = require('config');
const locationController = require('../controllers/locationController');
const Location = require('../models/locationModel');
const nlg = require('../utils/nlg');

const MAX_LOCATION = config.get('maxLocation');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }
    const Message = require('../messages/favouriteLocationMessages')(bot);

    const sendLocationList = (user) => {
        return Message.locationList(user);
    };

    const addNewLocation = (convo) => {
        const user = convo.get('user');
        if (user.locations.length >= MAX_LOCATION) {
            return Message.maxLocationReached(user, MAX_LOCATION);
        }
        return _askLocation(convo);
    };

    const editLocation = (convo) => {
        const location = convo.get('location');
        convo.set('name', location.name);
        convo.set('editing', true);
        return _askLocation(convo);
    };

    const addFirstLocation = (convo) => {
        const question = (convo) => {
            const user = convo.get('user');
            return Message.addFirstLocation(user);
        };

        const handleAnswer = (payload, convo) => {
            const user = convo.get('user');
            const text = payload.message.text;
            if (payload.message.quick_reply) return;
            return Message.chooseFromQuickReplies(user)
                .then(() => addFirstLocation(convo));
        };

        const callbacks = [
            {
                event: 'quick_reply:YES',
                callback: (payload, convo) => {
                    convo.set('firstLocation', true);
                    return _askLocation(convo);
                }
            },
            {
                event: 'quick_reply:NO',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    return Message.cancelRemoval(user)
                        .then(() => convo.end());
                }
            }
        ];

        const options = {};

        return convo.ask(question, handleAnswer, callbacks, options);
    };


    const removeLocation = (convo) => {
        const question = (convo) => {
            const user = convo.get('user');
            const location = convo.get('location');
            return Message.confirmRemoval(user, location);
        };

        const handleAnswer = (payload, convo) => {
            const user = convo.get('user');
            const text = payload.message.text;
            if (payload.message.quick_reply) return;
            return Message.chooseFromQuickReplies(user)
                .then(() => removeLocation(convo));
        };

        const callbacks = [
            {
                event: 'quick_reply:YES',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    const location = convo.get('location');
                    return locationController.removeFavourite(user, location)
                        .then(() => Message.locationRemoved(user, location))
                        .then(() => convo.end());
                }
            },
            {
                event: 'quick_reply:NO',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    return Message.cancelRemoval(user)
                        .then(() => convo.end());
                }
            }
        ];

        const options = {};

        return convo.ask(question, handleAnswer, callbacks, options);
    };

    const _askLocation = (convo) => {
        const question = (convo) => {
            const user = convo.get('user');
            const location = convo.get('location');
            const editing = convo.get('editing');
            if (editing) {
                return Message.editLocation(user, location);
            }
            return Message.newLocation(user);
        };

        const handleAnswer = (payload, convo) => {
            return locationController.fromPayload(payload)
                .then(location => {
                    convo.set('location', location);
                    return _askName(convo);
                })
                .catch(err => {
                    if (err.name !== 'LocationError') {
                        throw err;
                    }
                    console.error(err);
                    const user = convo.get('user');
                    return Message.invalidLocation(user)
                        .then(() => _askLocation(convo));
                });
        };

        const callbacks = [
            {
                event: 'quick_reply:CANCEL',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    return Message.canceled(user)
                        .then(() => convo.end());
                }
            },
            {
                event: 'quick_reply:DONT_MODIFY',
                callback: (payload, convo) => _askName(convo)
            }
        ];

        const options = {};

        return convo.ask(question, handleAnswer, callbacks, options);
    };

    const _askName = (convo) => {
        const question = (convo) => {
            const user = convo.get('user');
            const location = convo.get('location');
            const editing = convo.get('editing');
            if (editing) {
                return Message.editName(user, location);
            }
            return Message.newName(user, location);
        };

        const handleAnswer = (payload, convo) => {
            const user = convo.get('user');
            const text = payload.message.text;
            if (!text) {
                return Message.missingName(user)
                    .then(() => _askName(convo));
            }
            if (payload.message.quick_reply) return;
            let name = text.slice(0, 20);

            name = nlg.capitalize(name);
            convo.set('name', name);
            return _approveNewLocation(convo);
        };

        const callbacks = [
            {
                event: 'quick_reply:CANCEL',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    return Message.canceled(user)
                        .then(() => convo.end());
                }
            },
            {
                event: 'quick_reply:EDIT_LOCATION',
                callback: (payload, convo) => _askLocation(convo)
            },
            {
                event: 'quick_reply:DONT_MODIFY',
                callback: (payload, convo) => _approveNewLocation(convo)
            }
        ];

        const options = {};

        return convo.ask(question, handleAnswer, callbacks, options);
    };

    const _approveNewLocation = (convo) => {
        const question = (convo) => {
            const user = convo.get('user');
            const location = convo.get('location');
            const name = convo.get('name');

            return Message.approveNewLocation(user, location, name);
        };

        const handleAnswer = (payload, convo) => {
            const user = convo.get('user');
            const text = payload.message.text;
            if (payload.message.quick_reply) return;
            return Message.chooseFromQuickReplies(user)
                .then(() => _approveNewLocation(convo));
        };

        const callbacks = [
            {
                event: 'quick_reply:CANCEL',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    return Message.canceled(user)
                        .then(() => convo.end());
                }
            },
            {
                event: 'quick_reply:YES',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    const location = convo.get('location');
                    const name = convo.get('name');
                    const editing = convo.get('editing');
                    location.name = name;
                    return locationController.saveFavourite(user, location, editing)
                        .then(() => Message.newLocationAdded(user, name))
                        .then(() => {
                            if (convo.get('firstLocation')) {
                                return Message.firstLocationAdded(user);
                            }
                            return;
                        })
                        .then(() => convo.end());
                }
            },
            {
                event: 'quick_reply:EDIT_NAME',
                callback: (payload, convo) => _askName(convo)
            }
        ];

        const options = {};

        return convo.ask(question, handleAnswer, callbacks, options);
    };

    return {
        addFirstLocation,
        addNewLocation,
        editLocation,
        sendLocationList,
        removeLocation
    };

};