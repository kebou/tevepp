'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const createdAt = require('./plugins/createdAtPlugin');

const ImageSchema = new Schema({
    contentType: {
        type: String,
        required: [true, 'Image type is missing.']
    },
    data: {
        type: Buffer,
        required: [true, 'Image data is missing.']
    },
    type: String
});

ImageSchema.plugin(createdAt);

const deleteOlds = function () {
    let oldTime = new Date();
    oldTime.setHours(oldTime.getHours() - 2);
    return this.deleteMany()
        .where('type').equals('plan')
        .where('createdAt').lt(oldTime).exec();
};

ImageSchema.statics.deleteOlds = deleteOlds;




module.exports = mongoose.model('Image', ImageSchema);