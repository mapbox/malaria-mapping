# malaria-elimination

Visualize the mapping efforts of HOT and DigitalGlobe support of Malaria Elimination

## Requirements

- SQLite 3
- [tippecanoe](https://github.com/mapbox/tippecanoe)
- Node 4

```bash
npm install .
npm install -g osm-qa-filter
```

## Workflow

1. Prepare the QA tiles extract for the affected regions

```bash
./download-extract.sh
```

2. Filter buildings using [osm-qa-filter](https://github.com/lukasmartinelli/osm-qa-filter) to limit it to buildings edited after 1st of July 2016.

```bash
osm-qa-filter \
    -m malaria.qa.mbtiles -o malaria_buildings.geojson \
    --filter '["all", ["has", "building"], ["@timestamp", ">=", 1467331200]]'
```

3. Add the day since 1st of August as `@day` attribute to the features

```bash
./day.js -i malaria_buildings.geojson -o malaria_buildings_day.geojson
```


4. Calculate centroids of all the buildings

```bash
./centroid.js -i malaria_buildings_day.geojson -o malaria_buildings_day_centroid.geojson
```

5. Encode vector tiles (polygons for high zoom levels and points for low zoom levels) and stitch them back together into a single MBTiles.

```bash
tippecanoe --layer malaria_building -o malaria_buildings.mbtiles --include "@day" --minimum-zoom=11 --maximum-zoom=13 < malaria_buildings_day.geojson
tippecanoe --layer malaria_building -o malaria_buildings_low.mbtiles --include "@day" --minimum-zoom=5 --maximum-zoom=10 < malaria_buildings_day_centroid.geojson
./patch.sh malaria_buildings_low.mbtiles malaria_buildings.mbtiles
echo "update metadata set value = 5 where name = 'minzoom'" | sqlite3 malaria_buildings.mbtiles
rm malaria_buildings_low.mbtiles
```

6. Upload the vector tiles to Mapbox

7. Calculate buildings added by day and country

```bash
./building-totals.js -i malaria_buildings_day_centroid.geojson -o malaria_countries_buildings_day.geojson
```

