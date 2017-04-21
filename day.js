#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const split = require('split');
const stringify = require('stringify-stream');
const stream = require('stream');

const dateStream = new stream.Transform({ objectMode: true });
dateStream._transform = function (feature, encoding, done) {
  const timestamp = new Date(feature.properties['@timestamp'] * 1000);
  const start = new Date(2016, 7, 1);
  const diff = timestamp - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);

  feature.properties["@day"] = day;
  this.push(feature);
  done();
};

program
    .option('-i, --input <f>', 'GeoJSON source file')
    .option('-o, --output <f>', 'GeoJSON destination file')
    .parse(process.argv);

if (program.input && program.output) {
  fs.createReadStream(program.input)
    .pipe(split(JSON.parse, null, { trailing: false }))
    .pipe(dateStream)
    .pipe(stringify())
    .pipe(fs.createWriteStream(program.output));
} else {
  program.help();
}

