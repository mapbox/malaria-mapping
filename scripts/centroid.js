#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const turf = require('@turf/turf');
const stringify = require('stringify-stream');
const split = require('split');
const stream = require('stream');

const centroidStream = new stream.Transform( { objectMode: true } );
centroidStream._transform = function (feature, encoding, done) {
  // Shave away all attributes except day for centroid features
  const centroidFeature = turf.centroid(feature);
  centroidFeature.properties = feature.properties;
  this.push(centroidFeature);
  done();
};

program
    .option('-i, --input <f>', 'GeoJSON source file')
    .option('-o, --output <f>', 'GeoJSON destination file')
    .parse(process.argv);

if (program.input && program.output) {
  fs.createReadStream(program.input)
    .pipe(split(JSON.parse, null, { trailing: false }))
    .pipe(centroidStream)
    .pipe(stringify())
    .pipe(fs.createWriteStream(program.output));
} else {
  program.help();
}

