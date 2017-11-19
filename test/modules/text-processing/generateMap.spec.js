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
    // albertfalva utca 27 fehérváriról
    // 16 órakor indulnek a delibol a szarvashegy utcaba
    // Gellért térről eljussak a Margitszigetre
    // Nagykovácsi Nefelejcs utca 4
    // Szentendre pannonia utca 14/b-bol mennek szolokert kozbe
    // Silvanus setanyrol deak
    // blaha deak
    // moricz keleti
    // dlibol M2
    // szena ter 6os
    // Szentendre nap utca 52ből fehérvári út 199be
    // SAP hungarybol mennek a lévay utca 8ba
    // allebol kőbánya alsóra
    // albertfalva utca
    // albertfalva utca 17
    // Batthyány tér 1 Oktogon
    // BME Qbol keletibe
    // BME keletibe
    // A golgota terről mennék pomázra
    // A keletitol szeretnek menni a corvinushoz
    // a lotz károly utcából szeretnék eljutni a Nagyvárad térre
    // Batthyányi térről szeretnék eljutni a Váci út 16.-ba.
    // Blaha Lujza térről Haller utcába, éjszaka! :)
    // Móricz ceu 

    // [-]
    // virág utca 6ba népfürdő utca 10ből
    // 41, gárdonyi tér -> hosszal nyer a 41-gárdonyi-tér
    // Mikor indul a következő 41-es villamos Kamaraerdei Ifjúsági park megállóból?
    // !!Nyugati pályaudvar király utca -> google nem elég szigorú, van match az egészre, hossz miatt nyerni fog
    // !! Nyugati pályaudvar fehérvári út
    // Nyugati pályaudvarról Üllő, pesti útra
    // Szent Gellért térről a Blaha Lujza térre tartok
    // Szent Gellért térről a Nyúl utca 2-be
    // Széll Kálmán térről Solymárra
    // József Attila utcából Albertfalva utcába
    // József Attila utca 6ból Albertfalva utcába <--!!!
    // etele út fehérvári út
    // mikor indul a következő 16os bécsi kaputól?
    // A Fővám tértől a Ferenciek terére szeretnék menni
    // Göllner Mária regionális gimnázium
    // A határ úttól hogy jutok el a Blaha Lujza térre? -> magas ed megoldja
    // A Nemzeti SZínház az úticél
    // a tüske csarnokba hogyan melyik járattal juthatok a szent gellért térről?
    // akkor próbáljuk részletekben: Bécsi kapu tér - Széll Kálmán tér -> magas ed megoldja
    // Albertfalva kitérő 47-es villamos indulás
    // az etele út fehérvári út megállótól szeretnék eljutni a szendrő utca 44 a-ba -> mindent is megtalál
    // Buzogány utca 42-be szeretnék menni holnap délre 
    // Blaha-Móricz útvonal? 
    // Fehérvári út 114

describe('#generateMap module', () => {
    it('should work', (done) => {
        tp.process('Fehérvári út 17 andrássy út', { user: { locations }, MAX_WORD_NUMBER: 5 })
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
    'name' : 'Otthon',
    'userId' : 111,
    'type' : 'favourite',
    '__v' : 0,
    'createdAt' : '2017-10-18T15:44:20.587Z'
}];