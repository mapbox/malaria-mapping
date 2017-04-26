#!/bin/bash
set -euo pipefail
IFS=$'\n\t'
CSV="./malaria_buildings_progress.csv"
echo "Downloading QA Tiles"
./download-extract.sh
echo "Filtering the QA tiles to buildings"
osm-qa-filter \
    -m malaria.qa.mbtiles -o malaria_buildings.geojson \
    --filter '["all", ["has", "building"], [">=", "@timestamp", 1467331200]]'
echo "Limiting data to mapping areas"
./filter-area.js -i malaria_buildings.geojson -o malaria_buildings_filtered.geojson
echo "Generating daily stats"
./day-stats.js -i malaria_buildings_filtered.geojson -o "$CSV"
echo "Generated CSV $CSV"
