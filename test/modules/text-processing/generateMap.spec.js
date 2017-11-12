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
    .use(require('../../../modules/text-processing/generateMap'))
    .use(require('../../../modules/text-processing/rankPartitions'))
    .use(require('../../../modules/text-processing/printMap'));

    // [+]
    // albertfalva utca 47 fehérváriról
    // 16 órakor indulnek a delibol a szarvashegy utcaba
    // Gellért térről eljussak a Margitszigetre
    // Nagykovácsi Nefelejcs utca 4
    // Szentendre pannonia utca 14/b-bol mennek szolokert kozbe
    // Silvanus setanyrol deak
    // blaha deak
    // moricz keleti
    // delibol M2
    // szena ter 6os

    // [-]
    // virág utca 6ba népfürdő utca 10ből
    // 41, gárdonyi tér -> hosszal nyer a 41-gárdonyi-tér
    // Mikor indul a következő 41-es villamos Kamaraerdei Ifjúsági park megállóból?
    // Nyugati pályaudvar király utca -> google nem elég szigorú, van match az egészre, hossz miatt nyerni fog
    // Nyugati pályaudvarról Üllő, pesti útra
    // Szent Gellért térről a Blaha Lujza térre tartok
    // Szent Gellért térről a Nyúl utca 2-be
    // Széll Kálmán térről Solymárra
    // József Attila utcából Albertfalva utcába
    // József Attila utca 6ból Albertfalva utcába <--!!!

describe('#generateMap module', () => {
    it('should work', (done) => {
        tp.process('József Attila utca 6ból Albertfalva utcába', { user: { locations }, MAX_WORD_NUMBER: 5 })
            .then(() => {
                // const node = context.map[4][5];
                // console.log('\ntext\n----------');
                // console.log(node.text);
                // // console.log('\ntokens\n----------');
                // // console.log(node.tokens);
                // console.log('\nrole\n----------');
                // console.log(node.role);
                // console.log('\nelements\n----------');
                // console.log(node.elements);
                // console.log('\nelements rank\n----------');
                // const elements = node.elements;
                // for (let element of elements) {
                //     console.log(element.ranks);
                //     console.log(element.rank);
                // }
                // console.log('\nranks\n----------');
                // console.log(node.ranks);
                // console.log('\nrank\n----------');
                // console.log(node.rank);
            })
            .then(done, done)
            .catch(console.error);
    });
});

const locations = [{
    '_id' : '0101',
    'updatedAt' : '2017-10-18T10:25:17.467Z',
    'title' : 'Budapest, Műegyetem rakpart 5.',
    'latitude' : 47.4806205,
    'longitude' : 19.0559823,
    'city' : 'Budapest',
    'streetName' : 'Műegyetem rakpart',
    'streetNumber' : '5',
    'zipCode' : 1111,
    'name' : 'BME',
    'userId' : 111,
    'type' : 'favourite',
    '__v' : 0,
    'createdAt' : '2017-10-18T10:25:17.467Z'
},
{
    '_id' : '0102',
    'updatedAt' : '2017-10-18T15:44:20.587Z',
    'title' : 'Budapest, Fehérvári út 199.',
    'latitude' : 47.449869,
    'longitude' : 19.037322,
    'city' : 'Budapest',
    'streetName' : 'Fehérvári út',
    'streetNumber' : '199',
    'zipCode' : 1116,
    'name' : 'Fehérvári',
    'userId' : 111,
    'type' : 'favourite',
    '__v' : 0,
    'createdAt' : '2017-10-18T15:44:20.587Z'
}];