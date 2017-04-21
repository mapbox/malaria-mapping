#!/usr/bin/env node
'use strict';

const geojson = require('./countries.json');
const program = require('commander');
const fs = require('fs');
const split = require('split');
const stringify = require('stringify-stream');

const stream = require('stream');
const whichPolygon = require('which-polygon');
const query = whichPolygon(geojson);

const byCountryDay = { };
const byDay = { };

program
    .option('-i, --input <f>', 'GeoJSON source file')
    .option('--by-day-output <f>', 'GeoJSON destination file')
    .parse(process.argv);

if (program.input && program.output) {
  fs.createReadStream(program.input)
    .pipe(split(JSON.parse, null, { trailing: false }))
    .on('data', function(feature) {
      if (feature.geometry.type === 'Point') {
        const day = feature.properties['@day'];
        const result = query(feature.geometry.coordinates);
        if(!result) return;
        const country = result.admin;
        if (!(country in byCountryDay)) {
          byCountryDay[country] = {};
        }
        if (!(day in byCountryDay[country])) {
          byCountryDay[country][day] = 0;
        }
        byCountryDay[country][day] += 1;

        if (!(day in byDay)) {
          byDay[day] = 0;
        }
        byCountryDay[day] += 1;
      }
    })
    .on('end', function(err) {
      if(err) throw err;
      const countries = geojson.features.map(function(feature) {
        if(feature.properties.admin in byCountryDay) {
          feature.properties['buildings_by_day'] = byCountryDay[feature.properties.admin];
          return feature;
        };
        return null;
      }).filter(function(ft) { return !!ft; });
      fs.writeFileSync(program.output, JSON.stringify({
        "type":"FeatureCollection",
        "features": countries
      }));
      fs.writeFileSync(program.output, JSON.stringify({
        "type":"FeatureCollection",
        "features": countries
      }));
    });
} else {
  program.help();
}

