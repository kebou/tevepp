'use strict';
const rp = require('request-promise');
const bp = require('bluebird');
const parser = require('xml2js').Parser();
const parseXml = bp.promisify(parser.parseString);


const parseText = (text, modules, cb) => {
    if (text === undefined || typeof text !== 'string') {
        const err = new Error('A feldolgozandó text megadása kötelező!');
        err.name = 'InvalidArgumentError';
        throw err;
    }

    if (typeof modules === 'function' && cb === undefined) {
        cb = modules;
        modules = undefined;
    }

    return sendRequest(text, modules)
        .then(parseXml)
        .then(res => {
            const tokens = getTokens(res.GateDocument);
            const sentences = getSegments(res.GateDocument, 'Sentence');
            const nes = getSegments(res.GateDocument, 'NE');
            const nps = getSegments(res.GateDocument, 'NP');

            const data = {
                text,
                tokens,
                sentences,
                nes,
                nps
            };

            if (cb) cb(null, data);
            return Promise.resolve(data);
        })
        .catch(err => {
            if (cb) cb(err);
            return Promise.reject(err);
        });
};

const sendRequest = (text, modules) => {
    if (!Array.isArray(modules) || (Array.isArray(modules) && modules.length < 1)) {
        modules = ['morph', 'token', 'pos', 'syntax', 'npchunk', 'ner'];
    }

    const rpOptions = {
        url: 'http://e-magyar.hu/hu/parser/check',
        json: true,
        form: {
            text,
            'module[]': modules
        },
        qsStringifyOptions: { arrayFormat: 'repeat' }
    };

    return rp.post(rpOptions)
        .then(res => {
            if (res.status !== true) {
                const err = new Error();
                err.name = 'InvalidArgumentError';
                throw err;
            }
            return res.xml;
        });
};


const getTokens = (gateDocument) => {
    const annotationSet = gateDocument.AnnotationSet[0];
    const tokenList = annotationSet.Annotation.filter(annotation => annotation.$.Type === 'Token');
    const tokens = tokenList.map(token => {
        let featureSet = {};
        token.Feature.map(feature => {
            const name = feature.Name[0]._;
            const value = feature.Value[0]._;
            featureSet[name] = value;
        });

        return {
            id: token.$.Id,
            type: token.$.Type.toLowerCase(),
            start: token.$.StartNode,
            end: token.$.EndNode,
            content: featureSet.string ? featureSet.string : null,
            lemma: featureSet.lemma || null,
            anas: featureSet.anas || null,
            hfstana: featureSet.hfstana || null,
            pos: featureSet.pos || null,
            chunk: featureSet['NP_BIO'] || null,
            deptype: featureSet.depType || null,
            targetId: featureSet.depTarget || null,
            cons: featureSet.cons || null,
            ner: featureSet['NER_BIO1'] || null
        };
    });
    return tokens;
};

const getSegments = (gateDocument, segmentType) => {
    const annotationSet = gateDocument.AnnotationSet[0];
    const segmentList = annotationSet.Annotation.filter(annotation => annotation.$.Type === segmentType);

    const segments = segmentList.map(segment => {
        let featureSet = {};
        segment.Feature.map(feature => {
            const name = feature.Name[0]._;
            const value = feature.Value[0]._;
            featureSet[name] = value;
        });
        return {
            id: segment.$.Id,
            start: segment.$.StartNode,
            end: segment.$.EndNode,
            content: featureSet.string || featureSet.text || null
        };
    });
    return segments;
};

module.exports = {
    parseText
};