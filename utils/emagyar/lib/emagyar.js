'use strict';
const rp = require('request-promise');
const bp = require('bluebird');
const parser = require('xml2js').Parser();
const parseXml = bp.promisify(parser.parseString);

class Emagyar {
    constructor(url, modules) {
        this.url = url || 'http://localhost:8000/process';
        this.modules = modules || ['emToken', 'emMorph', 'emTag', 'emCons', 'emDep', 'emChunk', 'emNer'];
    }

    parseText(text, modules, cb) {
        if (text === undefined || typeof text !== 'string') {
            const err = new Error('A feldolgozandó text megadása kötelező!');
            err.name = 'InvalidArgumentError';
            throw err;
        }

        if (typeof modules === 'function' && cb === undefined) {
            cb = modules;
            modules = undefined;
        }

        return this._sendRequest(text, modules)
            .then(parseXml)
            .then(res => {
                const tokens = this._getTokens(res.GateDocument);
                const sentences = this._getSegments(res.GateDocument, 'Sentence');
                const nes = this._getSegments(res.GateDocument, 'NE');
                const nps = this._getSegments(res.GateDocument, 'NP');

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
    }

    _sendRequest(text, modules) {
        if (!Array.isArray(modules) || (Array.isArray(modules) && modules.length < 1)) {
            modules = this.modules;
        }
        const rpOptions = {
            url: this.url,
            json: true,
            qs: {
                run: this._formatModulesQuery(modules),
                text
            }
        };
        return rp.get(rpOptions);
    }

    _formatModulesQuery (modules) {
        const modMap = {
            emToken: 'QT',
            emMorph: 'HFSTLemm',
            emTag: 'ML3-PosLem-hfstcode',
            emCons: 'ML3-Cons',
            emDep: 'ML3-Dep',
            emChunk: 'huntag3-NP-pipe-hfstcode',
            emNer: 'huntag3-NER-pipe-hfstcode'
        };
        const m = modules.map(x => modMap[x] || x);
        return m.join(',');
    }
    
    _getTokens(gateDocument) {
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
    }
    
    _getSegments (gateDocument, segmentType) {
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
    }
}

module.exports = Emagyar;