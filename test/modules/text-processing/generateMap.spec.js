'use strict';
/* eslint-disable no-undef*/
const chai = require('chai');   // eslint-disable-line no-unused-vars
const should = require('chai').should(); // eslint-disable-line no-unused-vars
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
    //.use(require('../../../modules/text-processing/printMap'))
    .use(require('../../../modules/text-processing/returnContext'));

// [-]
// - Nagykovácsi Nefelejcs utca 4 -> nagykovácsiból, alapfeltevés
// - !!Nyugati pályaudvar király utca -> google nem elég szigorú, van match az egészre, hossz miatt nyerni fog
// - !! Nyugati pályaudvar fehérvári út
// - etele út fehérvári út
// - Göllner Mária regionális gimnázium
// - A határ úttól hogy jutok el a Blaha Lujza térre? -> magas ed megoldja
// - A Nemzeti SZínház az úticél
// - akkor próbáljuk részletekben: Bécsi kapu tér - Széll Kálmán tér -> magas ed megoldja, eltalálja így is
// - Albertfalva kitérő 47-es villamos indulás -> eltalálja, de a villamos és az indulás is benne marad, kiszűrhető
// - az etele út fehérvári út megállótól szeretnék eljutni a szendrő utca 44 a-ba -> megálló is benne marad
// + Buzogány utca 42-be szeretnék menni holnap délre -> dél benne marad, alapfeltevés
// Mikor indul a következő 41-es villamos Kamaraerdei Ifjúsági park megállóból? -> 41-es, Kamaraerdei Ifjúsági park megálló
// kiindulás Tétényi út 30. cél Andor utca -> felismeri, cél benne marad
// - Klinikák metro állomástól az Eurocenterhez
// - Kérlek most írd meg, a Blaháról milyen gyorsan jutok a Margit hídhoz.
// - Meg tudnád mondani, hogy a Keletiből mennyi idő alatt érek át a Kelenföldre?
// - Mikor indul az utolsó M3 metró Újpest Központból? -> újpest központ külön írva nem ad találatot
// - Mikor indul HÉV Szentendréről Békásra? -> békást nem ismeri
// - Mikor megy legközelebb hármas metró a Deák térről kőbánya felé?
// - Mikor indul a következő busz Bikás Park metróállomástól a Kosztolányi Dezső tér felé?

const locations = [{
    '_id': '0101',
    'updatedAt': '2017-10-18T10:25:17.467Z',
    'title': 'Budapest, Műegyetem rakpart 5.',
    'latitude': 47.4806205,
    'longitude': 19.0559823,
    'city': 'Budapest',
    'streetName': 'Műegyetem rakpart',
    'streetNumber': '5',
    'zipCode': 1111,
    'name': 'BME',
    'userId': 111,
    'type': 'favourite',
    '__v': 0,
    'createdAt': '2017-10-18T10:25:17.467Z'
},
{
    '_id': '0102',
    'updatedAt': '2017-10-18T15:44:20.587Z',
    'title': 'Budapest, Fehérvári út 199.',
    'latitude': 47.449869,
    'longitude': 19.037322,
    'city': 'Budapest',
    'streetName': 'Fehérvári út',
    'streetNumber': '199',
    'zipCode': 1116,
    'name': 'Otthon',
    'userId': 111,
    'type': 'favourite',
    '__v': 0,
    'createdAt': '2017-10-18T15:44:20.587Z'
}];

const tpObject = {
    user: { locations },
    MAX_WORD_NUMBER: 5
};

describe('#generateMap module', () => {
    it('albertfalva utca 27 fehérváriról', (done) => {
        tp.process('albertfalva utca 27 fehérváriról', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('albertfalva utca 27');
                bestNodes[1].text.should.have.to.equal('fehérvári');
            })
            .then(done, done);
    });
    it('moszkva tér nyugati', (done) => {
        tp.process('moszkva tér nyugati', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('moszkva tér');
                bestNodes[1].text.should.have.to.equal('nyugati');
            })
            .then(done, done);
    });
    it('16 órakor indulnek a delibol a szarvashegy utcaba', (done) => {
        tp.process('16 órakor indulnek a delibol a szarvashegy utcaba', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(3);
                bestNodes[0].text.should.have.to.equal('16');
                bestNodes[1].text.should.have.to.equal('deli');
                bestNodes[2].text.should.have.to.equal('szarvashegy utca');
            })
            .then(done, done);
    });
    it('Gellért térről eljussak a Margitszigetre', (done) => {
        tp.process('Gellért térről eljussak a Margitszigetre', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Gellért tér');
                bestNodes[1].text.should.have.to.equal('Margitsziget');
            })
            .then(done, done);
    });
    it('Silvanus setanyrol deak', (done) => {
        tp.process('Silvanus setanyrol deak', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Silvanus setany');
                bestNodes[1].text.should.have.to.equal('deak');
            })
            .then(done, done);
    });
    it('blaha deak', (done) => {
        tp.process('blaha deak', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('blaha');
                bestNodes[1].text.should.have.to.equal('deak');
            })
            .then(done, done);
    });
    it('moricz keleti', (done) => {
        tp.process('moricz keleti', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('moricz');
                bestNodes[1].text.should.have.to.equal('keleti');
            })
            .then(done, done);
    });
    it('delibol M2', (done) => {
        tp.process('delibol M2', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('deli');
                bestNodes[1].text.should.have.to.equal('M2');
            })
            .then(done, done);
    });
    it('szena ter 6os', (done) => {
        tp.process('szena ter 6os', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('szena ter');
                bestNodes[1].text.should.have.to.equal('6os');
            })
            .then(done, done);
    });
    it('Szentendre nap utca 52ből fehérvári út 199be', (done) => {
        tp.process('Szentendre nap utca 52ből fehérvári út 199be', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Szentendre nap utca');
                bestNodes[1].text.should.have.to.equal('fehérvári út 199');
            })
            .then(done, done);
    });
    it('SAP hungarybol mennek a lévay utca 8ba', (done) => {
        tp.process('SAP hungarybol mennek a lévay utca 8ba', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('SAP hungary');
                bestNodes[1].text.should.have.to.equal('lévay utca 8');
            })
            .then(done, done);
    });
    it('allebol kőbánya alsóra', (done) => {
        tp.process('allebol kőbánya alsóra', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('alle');
                bestNodes[1].text.should.have.to.equal('kőbánya alsó');
            })
            .then(done, done);
    });
    it('albertfalva utca', (done) => {
        tp.process('albertfalva utca', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(1);
                bestNodes[0].text.should.have.to.equal('albertfalva utca');
            })
            .then(done, done);
    });
    it('albertfalva utca 17', (done) => {
        tp.process('albertfalva utca 17', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('albertfalva utca');
                bestNodes[1].text.should.have.to.equal('17');
            })
            .then(done, done);
    });
    it('Batthyány tér 1 Oktogon', (done) => {
        tp.process('Batthyány tér 1 Oktogon', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Batthyány tér 1');
                bestNodes[1].text.should.have.to.equal('Oktogon');
            })
            .then(done, done);
    });
    it('BME Qbol keletibe', (done) => {
        tp.process('BME Qbol keletibe', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('BME Q');
                bestNodes[1].text.should.have.to.equal('keleti');
            })
            .then(done, done);
    });
    it('BME keletibe', (done) => {
        tp.process('BME keletibe', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('BME');
                bestNodes[1].text.should.have.to.equal('keleti');
            })
            .then(done, done);
    });
    it('A golgota terről mennék pomázra', (done) => {
        tp.process('A golgota terről mennék pomázra', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('golgota ter');
                bestNodes[1].text.should.have.to.equal('pomáz');
            })
            .then(done, done);
    });
    it('a lotz károly utcából szeretnék eljutni a Nagyvárad térre', (done) => {
        tp.process('a lotz károly utcából szeretnék eljutni a Nagyvárad térre', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('lotz károly utca');
                bestNodes[1].text.should.have.to.equal('Nagyvárad tér');
            })
            .then(done, done);
    });
    it('Batthyányi térről szeretnék eljutni a Váci út 16.-ba.', (done) => {
        tp.process('Batthyányi térről szeretnék eljutni a Váci út 16.-ba.', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Batthyányi tér');
                bestNodes[1].text.should.have.to.equal('Váci út 16.');
            })
            .then(done, done);
    });
    it('Blaha Lujza térről Haller utcába, éjszaka! :)', (done) => {
        tp.process('Blaha Lujza térről Haller utcába, éjszaka! :)', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Blaha Lujza tér');
                bestNodes[1].text.should.have.to.equal('Haller utca');
            })
            .then(done, done);
    });
    it('Móricz ceu', (done) => {
        tp.process('Móricz ceu', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Móricz');
                bestNodes[1].text.should.have.to.equal('ceu');
            })
            .then(done, done);
    });
    it('virág utca 6ba népfürdő utca 10ből', (done) => {
        tp.process('virág utca 6ba népfürdő utca 10ből', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('virág utca');
                bestNodes[1].text.should.have.to.equal('népfürdő utca');
            })
            .then(done, done);
    });
    it('41, gárdonyi tér', (done) => {
        tp.process('41, gárdonyi tér', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('41');
                bestNodes[1].text.should.have.to.equal('gárdonyi tér');
            })
            .then(done, done);
    });
    it('Nyugati pályaudvarról Üllő, pesti útra', (done) => {
        tp.process('Nyugati pályaudvarról Üllő, pesti útra', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Nyugati pályaudvar');
                bestNodes[1].text.should.have.to.equal('Üllő pesti út');
            })
            .then(done, done);
    });
    it('Szent Gellért térről a Blaha Lujza térre tartok', (done) => {
        tp.process('Szent Gellért térről a Blaha Lujza térre tartok', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Szent Gellért tér');
                bestNodes[1].text.should.have.to.equal('Blaha Lujza tér');
            })
            .then(done, done);
    });
    it('Szent Gellért térről a Nyúl utca 2-be', (done) => {
        tp.process('Szent Gellért térről a Nyúl utca 2-be', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Szent Gellért tér');
                bestNodes[1].text.should.have.to.equal('Nyúl utca 2');
            })
            .then(done, done);
    });
    it('Széll Kálmán térről Solymárra', (done) => {
        tp.process('Széll Kálmán térről Solymárra', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Széll Kálmán tér');
                bestNodes[1].text.should.have.to.equal('Solymár');
            })
            .then(done, done);
    });
    it('József Attila utcából Albertfalva utcába', (done) => {
        tp.process('József Attila utcából Albertfalva utcába', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('József Attila utca');
                bestNodes[1].text.should.have.to.equal('Albertfalva utca');
            })
            .then(done, done);
    });
    it('József Attila utca 6ból Albertfalva utcába', (done) => {
        tp.process('József Attila utca 6ból Albertfalva utcába', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('József Attila utca');
                bestNodes[1].text.should.have.to.equal('Albertfalva utca');
            })
            .then(done, done);
    });
    it('tüske csarnokba hogyan melyik járattal juthatok a szent gellért térről?', (done) => {
        tp.process('tüske csarnokba hogyan melyik járattal juthatok a szent gellért térről?', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('tüske csarnok');
                bestNodes[1].text.should.have.to.equal('szent gellért tér');
            })
            .then(done, done);
    });
    it('Blaha Móricz útvonal?', (done) => {
        tp.process('Blaha Móricz útvonal?', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Blaha');
                bestNodes[1].text.should.have.to.equal('Móricz');
            })
            .then(done, done);
    });
    it('Fehérvári út 114', (done) => {
        tp.process('Fehérvári út 114', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Fehérvári út');
                bestNodes[1].text.should.have.to.equal('114');
            })
            .then(done, done);
    });
    it('A Fővám tértől a Ferenciek terére szeretnék menni', (done) => {
        tp.process('A Fővám tértől a Ferenciek terére szeretnék menni', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Fővám tér');
                bestNodes[1].text.should.have.to.equal('Ferenciek tér');
            })
            .then(done, done);
    });
    it('A keletitol szeretnek menni a corvinushoz', (done) => {
        tp.process('A keletitol szeretnek menni a corvinushoz', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('keleti');
                bestNodes[1].text.should.have.to.equal('corvinus');
            })
            .then(done, done);
    });
    it('mikó utcából kelenföldre', (done) => {
        tp.process('mikó utcából kelenföldre', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('mikó utca');
                bestNodes[1].text.should.have.to.equal('kelenföld');
            })
            .then(done, done);
    });
    it('Szentendre pannonia utca 14/b-bol mennek szolokert kozbe', (done) => {
        tp.process('Szentendre pannonia utca 14/b-bol mennek szolokert kozbe', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(3);
                bestNodes[0].text.should.have.to.equal('Szentendre pannonia utca');
                bestNodes[1].text.should.have.to.equal('14/b');
                bestNodes[2].text.should.have.to.equal('szolokert koz');
            })
            .then(done, done);
    });
    it('mikor indul a következő 16os bécsi kaputól?', (done) => {
        tp.process('mikor indul a következő 16os bécsi kaputól?', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('16os');
                bestNodes[1].text.should.have.to.equal('bécsi kapu');
            })
            .then(done, done);
    });
    it('hogyan jutok el az etele térről az újbuda centerbe', (done) => {
        tp.process('hogyan jutok el az etele térről az újbuda centerbe', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('etele tér');
                bestNodes[1].text.should.have.to.equal('újbuda center');
            })
            .then(done, done);
    });
    it.skip('Klinikák metrómegállótól indulnék a Nyugati pályaudvarra', (done) => {
        tp.process('Klinikák metrómegállótól indulnék a Nyugati pályaudvarra', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Klinikák metrómegálló');
                bestNodes[1].text.should.have.to.equal('indulnék Nyugati pályaudvar');
            })
            .then(done, done);
    });
    it('Kálvin térről hogyan jutok el a parlamenthez?', (done) => {
        tp.process('Kálvin térről hogyan jutok el a parlamenthez?', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Kálvin tér');
                bestNodes[1].text.should.have.to.equal('parlament');
            })
            .then(done, done);
    });
    it('Mennyi időbe telik az Astoriától a Városmajori Gimnáziumig eljutni?', (done) => {
        tp.process('Mennyi időbe telik az Astoriától a Városmajori Gimnáziumig eljutni?', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('Astoria');
                bestNodes[1].text.should.have.to.equal('Városmajori Gimnázium');
            })
            .then(done, done);
    });
    it('Mikor indul a 29-es busz a Szentlélek térről?', (done) => {
        tp.process('Mikor indul a 29-es busz a Szentlélek térről?', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('29-es');
                bestNodes[1].text.should.have.to.equal('Szentlélek tér');
            })
            .then(done, done);
    });
    it.skip('Mikor indul a 33-as busz a budafoki út dombóvári út megállóból?', (done) => {
        tp.process('Mikor indul a 33-as busz a budafoki út dombóvári út megállóból?', tpObject)
            .then(ctx => {
                ctx.should.have.property('map');
                ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const { partitions } = ctx;
                const bestMatch = partitions[0];
                bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                const bestNodes = bestMatch.nodes;
                bestNodes.should.to.have.lengthOf(2);
                bestNodes[0].text.should.have.to.equal('33-as');
                bestNodes[1].text.should.have.to.equal('budafoki út dombóvári út');
            })
            .then(done, done);
    });
});