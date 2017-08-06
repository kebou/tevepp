'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    image: String
}, { timestamps: true });

//FeedbackSchema.plugin(createdAt);

module.exports = mongoose.model('Feedback', FeedbackSchema);