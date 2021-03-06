'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    _id: {
        type: String,
        required: [true, 'Facebook page-scoped ID is missing.']
    },
    firstName: String,
    lastName: String,
    profilePic: String,
    locale: String,
    timezone: Number,
    gender: {
        type: String,
        enum: ['male', 'female', null]
    },
    preferredLocale: String,
    locations: [{
        type: Schema.Types.ObjectId,
        ref: 'Location'
    }],
    role: {
        type: String,
        enum: ['admin', 'tester', 'user'],
        default: 'user'
    },
    source: {
        type: String
    }
}, { timestamps: true, toObject: { virtuals: true } });

UserSchema.virtual('new').get(function () {
    let oldTime = new Date();
    oldTime.setHours(oldTime.getHours() - 4);
    return this.createdAt > oldTime;
});

module.exports = mongoose.model('User', UserSchema);