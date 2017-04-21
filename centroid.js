'use strict';

const program = require('commander');
const fs = require('fs');
const turf = require('@turf/turf');
const geojsonStream = require('geojson-stream');
const split = require('split');

program
    .option('-i, --input <f>', 'GeoJSON source file')
    .parse(process.argv);

if (program.input) {
  const splitStream = split(JSON.parse, null, { trailing: false })
  const stream = fs.createReadStream(program.input).pipe(splitStream);
  stream.on('data', function(feature) {
    feature = turf.centroid(feature);
    console.log(JSON.stringify(feature));
  });
}

