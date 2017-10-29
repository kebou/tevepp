'use strict';
const chai = require('chai');
const should = require('chai').should();
const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL;
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, { useMongoClient: true });

const TextProcessor = require('../../../modules/text-processing/textProcessor');
const tp = new TextProcessor();

let context;
const revealCtx = (ctx, next) => {
    context = ctx;
    return next();
};

tp.use(revealCtx)
    .use(require('../../../modules/text-processing/parseText'))
    .use(require('../../../modules/text-processing/generateMap'));


describe('#generateMap module', () => {
    it('should work', (done) => {
        tp.process('albertfalva utca 8 lévay utca 10')
            .then(() => {
                console.log(context.map)
                //context.map.map(x => x.map(y => console.log(y)));
            })
            .then(done, done);
    });
});