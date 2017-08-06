'use strict';
const BootBot = require('bootbot');
const Image = require('../models/imageModel');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }

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
};