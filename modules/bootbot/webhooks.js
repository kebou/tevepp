'use strict';
const BootBot = require('bootbot');
const Image = require('../../models/imageModel');
const logger = require('winston');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }
    const userController = require('../../controllers/userController')(bot);
    const locationController = require('../../controllers/locationController');
    const TripPlanning = require('../../intents/tripPlanning')(bot);
    const Alias = require('../../controllers/aliasController');

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

    bot.app.get('/update/alias', (req, res) => {
        Alias.update()
            .then(aliases => {
                logger.info('Alias list updated.');
                res.status(200).json(aliases);
            })
            .catch(err => {
                logger.error('Error while updating aliases:', err);
                return res.status(500).send('Alias update failed.');
            });
    });

    // bot.app.get('/loadtest', (req, res) => {
    //     let user, start;
    //     userController.getUser('1405829276203024')
    //         .then(res => {
    //             user = res;
    //             return locationController.fromText('albertfalva utca', user.id);
    //         })
    //         .then(res => {
    //             start = res;
    //             return locationController.fromText('szentendre', user.id);
    //         })
    //         .then(stop => TripPlanning.planTrip(user, start, stop))
    //         .then(() => res.sendStatus(200))
    //         .catch(console.error);
    // });
};