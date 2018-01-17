'use strict';
/* eslint-disable no-undef*/
const chai = require('chai');   // eslint-disable-line no-unused-vars
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL;
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, { useMongoClient: true });

const questions = require('./questions.json');

const TextProcessor = require('../../../modules/text-processing/textProcessor');
const tp = new TextProcessor();

let context;
const revealCtx = (ctx, next) => {
    context = ctx;
    return next();
};

tp.use(revealCtx)
    .use(require('../../../modules/text-processing/parseText'))
    .use(require('../../../modules/text-processing/generateMap'))
    .use(require('../../../modules/text-processing/rankPartitions'))
    //.use(require('../../../modules/text-processing/printMap'))
    .use(require('../../../modules/text-processing/returnContext'));


const tpObject = {
    user: { },
    MAX_WORD_NUMBER: 5
};


const processQuestion = (question, idx) => {
    return tp.process(question, tpObject)
        .then(ctx => {
            const { partitions } = ctx;
            const bestMatch = partitions[0];
            console.log(`${idx}`, '-', question,  'SCORE:', bestMatch ? bestMatch.score : 0);
        });
};

const processQuestions = (questions, startIdx, endIdx) => {
    return questions.reduce((prev, question, idx) => {
        if ((startIdx !== undefined && startIdx > idx) || (endIdx !== undefined && idx > endIdx)) {
            return prev;
        }
        return prev.then(() => processQuestion(question, idx));
    }, Promise.resolve());
};


/////////////////////////////////////////////////////
console.log('Start processing\n');
processQuestions(questions, 130)
    .then(() => {
        console.log('\nProcessing has been finished.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
    });
/////////////////////////////////////////////////////


// Disconnect mongoose on app termination
const onExiting = (code) => {
    const exitCode = code || 0;
    mongoose.disconnect()
        .then(() => {
            logger.info('Mongoose is disconnected through app termination.');
            process.exit(exitCode);
        });
};
process.on('SIGINT', onExiting).on('SIGTERM', onExiting);

process.on('uncaughtException', (err) => {
    logger.error('Exiting with uncaught Exception: ' + err.toString());
    onExiting(1);
});