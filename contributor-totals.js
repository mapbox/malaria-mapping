#!/usr/bin/env node
'use strict';
const program = require('commander');
const fs = require('fs');
const split = require('split');
const stream = require('stream');

const byUser = new Set();

program
    .option('-i, --input <f>', 'GeoJSON source file')
    .option('-o, --output <f>', 'GeoJSON destination file')
    .parse(process.argv);

if (program.input && program.output) {
  fs.createReadStream(program.input)
    .pipe(split(JSON.parse, null, { trailing: false }))
    .on('data', function(feature) {
      const user = feature.properties['@user'];
      if (!(user in byUser)) {
        byUser[user] = 0;
      }
      byUser[user] += 1;
    })
    .on('end', function(err) {
      if(err) throw err;

      let contributors = 0;
      let buildings = 0;
      for(var user in byUser) {
        buildings += byUser[user];
        contributors += 1;
      }

      fs.writeFileSync(program.output, JSON.stringify({"contributors": contributors, "buildings": buildings}));
    });
} else {
  program.help();
}

