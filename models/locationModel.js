'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    userId: {
        type: Number,
        required: [true, 'Facebook page-scoped ID is missing.'],
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Location title is missing.']
    },
    fbTitle: String,
    latitude: {
        type: Number,
        required: [true, 'Location latitude is missing.']
    },
    longitude: {
        type: Number,
        required: [true, 'Location longitude is missing.']
    },
    city: String,
    streetName: String,
    streetNumber: String,
    zipCode: Number,
    type: {
        type: String,
        enum: ['favourite', 'log']
    },
    name: String,
    source: {
        type: String,
        enum: ['locationPicker', 'favourites', 'text', 'stop']
    }
}, { timestamps: true, toObject: { virtuals: true } });

LocationSchema.options.toObject.transform = (doc, ret) => {
    delete ret._id;
    delete ret.id;
    return ret;
};

LocationSchema.virtual('shortTitle').get(function () {
    if (this.streetName && this.streetNumber)
        return `${this.streetName} ${this.streetNumber}.`;

    if (this.streetName)
        return `${this.streetName}`;

    return this.title;
});

LocationSchema.statics.findFavourites = function (userId) {
    return this.find({ userId: userId, type: 'favourite' }).exec();
};

LocationSchema.statics.removeFavourite = function (locationId) {
    return this.findOneAndRemove({ _id: locationId }).exec();
};

LocationSchema.statics.updateFavourite = function (locationId, update) {
    return this.findOneAndUpdate({ _id: locationId }, update).exec();
};

module.exports = mongoose.model('Location', LocationSchema);