#!/usr/bin/env node
'use strict';
const program = require('commander');
const fs = require('fs');
const split = require('split');
const stream = require('stream');

const byDay = { };

program
    .option('-i, --input <f>', 'GeoJSON source file')
    .option('-o, --output <f>', 'GeoJSON destination file')
    .parse(process.argv);

if (program.input && program.output) {
  fs.createReadStream(program.input)
    .pipe(split(JSON.parse, null, { trailing: false }))
    .on('data', function(feature) {
      if (feature.geometry.type === 'Point') {
        const day = feature.properties['@day'];
        if (!(day in byDay)) {
          byDay[day] = 0;
        }
        byDay[day] += 1;
      }
    })
    .on('end', function(err) {
      if(err) throw err;
      fs.writeFileSync(program.output, JSON.stringify(byDay));
    });
} else {
  program.help();
}

