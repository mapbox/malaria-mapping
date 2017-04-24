#!/usr/bin/env node
'use strict';
const program = require('commander');
const turf = require('@turf/turf');
const fs = require('fs');
const split = require('split');
const stringify = require('stringify-stream');
const stream = require('stream');
const geojson = require('./mapped_areas.json');
const whichPolygon = require('which-polygon');
const query = whichPolygon(geojson);

const filterStream = new stream.Transform( { objectMode: true } );
filterStream._transform = function (feature, encoding, done) {
  let result = null;
  if (feature.geometry.type === 'Point') {
    result = query(feature.geometry.coordinates);
  } else {
    const centroidFeature = turf.centroid(feature);
    result = query(centroidFeature.geometry.coordinates);
  }

  if (result) {
    this.push(feature);
  }

  done();
};

program
    .option('-i, --input <f>', 'GeoJSON source file')
    .option('-o, --output <f>', 'GeoJSON destination file')
    .parse(process.argv);

if (program.input && program.output) {
  fs.createReadStream(program.input)
    .pipe(split(JSON.parse, null, { trailing: false }))
    .pipe(filterStream)
    .pipe(stringify())
    .pipe(fs.createWriteStream(program.output));
} else {
  program.help();
}

