#!/usr/bin/env node
'use strict';
const program = require('commander');
const fs = require('fs');
const split = require('split');
const stream = require('stream');
const csvWriter = require('csv-write-stream')

const byDay = { };

Date.prototype.formatMMDDYYYY = function() {
    return (this.getMonth() + 1) +
    "/" +  this.getDate() +
    "/" +  this.getFullYear();
};

program
    .option('-i, --input <f>', 'GeoJSON source file')
    .option('-o, --output <f>', 'CSV destination file')
    .parse(process.argv);

if (program.input && program.output) {
  const writer = csvWriter();
  writer.pipe(fs.createWriteStream(program.output));
  fs.createReadStream(program.input)
    .pipe(split(JSON.parse, null, { trailing: false }))
    .on('data', function(feature) {
      const user = feature.properties['@user'];
      const changeset = feature.properties['@changeset'];
      const timestamp = new Date(feature.properties['@timestamp'] * 1000);
      const date = timestamp.formatMMDDYYYY();

      if (!(date in byDay)) {
        byDay[date] = {
          contributors: new Set(),
          changesets: new Set(),
          buildings: 0
        };
      }
      const day = byDay[date];
      day.buildings += 1;
      day.contributors.add(user);
      day.changesets.add(changeset);
    })
    .on('end', function(err) {
      if(err) throw err;
      for(var date in byDay) {
        const day = byDay[date];
        writer.write({
          date: date,
          buildings: day.buildings,
          contributors: day.contributors.size,
          changesets: day.changesets.size
        });
      }
      writer.end();
    });
} else {
  program.help();
}

