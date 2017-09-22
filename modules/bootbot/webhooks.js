'use strict';
const BootBot = require('bootbot');
const Image = require('../../models/imageModel');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }
    const userController = require('../../controllers/userController')(bot);
    const locationController = require('../../controllers/locationController');
    const TripPlanning = require('../../intents/tripPlanning')(bot);

    bot.app.get('/image/:imageId', (req, res) => {
        const imgId = req.params.imageId;

        Image.findById(imgId).exec()
            .then(img => {
                res.type(img.contentType);
                res.write(img.data);
                res.end();
            })
            .catch(() => {
                res.status(404);
                res.send('Image Not Found');
                res.end();
            });
    });

    bot.app.get('/loadtest', (req, res) => {
        let user, start;
        userController.getUser('1405829276203024')
            .then(res => {
                user = res;
                return locationController.fromText('albertfalva utca', user.id);
            })
            .then(res => {
                start = res;
                return locationController.fromText('szentendre', user.id);
            })
            .then(stop => TripPlanning.planTrip(user, start, stop))
            .then(() => res.sendStatus(200))
            .catch(console.error);
    });
};