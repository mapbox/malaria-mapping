# Mapping for Malaria Elimination

Visualize the mapping efforts of HOT and DigitalGlobe support of Malaria Elimination

**:earth_africa: https://mapbox.com/malaria-mapping**

See the [Tasking Manager](http://tasks.hotosm.org/?sort_by=priority&direction=asc&search=malaria+elimination) to learn how you can help and finish mapping 500,000 km2!

![Malaria mapping progress](https://cloud.githubusercontent.com/assets/22896/25358290/e1203e0e-290e-11e7-81a2-ee7758a88f43.gif)

## Requirements

- SQLite 3
- [tippecanoe](https://github.com/mapbox/tippecanoe)
- Node 4

```bash
npm install .
npm install -g osm-qa-filter
```

## Data Processing

You can find the data processing scripts in `scripts`.

```bash
cd ./scripts
```

1. Prepare the QA tiles extract for the affected regions

```bash
./download-extract.sh
```

2. Filter buildings using [osm-qa-filter](https://github.com/lukasmartinelli/osm-qa-filter) to limit it to buildings edited after 1st of July 2016.

```bash
osm-qa-filter \
    -m malaria.qa.mbtiles -o malaria_buildings.geojson \
    --filter '["all", ["has", "building"], [">=", "@timestamp", 1467331200]]'
```

3. Filter to the mapped area

```bash
./filter-area.js -i malaria_buildings.geojson -o malaria_buildings_filtered.geojson
```

4. Add the date as attribute to the features.

```bash
./day.js -i malaria_buildings_filtered.geojson -o malaria_buildings_day.geojson
```


5. Calculate centroids of all the buildings

```bash
./centroid.js -i malaria_buildings_day.geojson -o malaria_buildings_day_centroid.geojson
```

6. Encode vector tiles (polygons for high zoom levels and points for low zoom levels) and stitch them back together into a single MBTiles.

```bash
tippecanoe --layer malaria_building -o malaria_buildings.mbtiles --include "@day" --minimum-zoom=11 --maximum-zoom=13 < malaria_buildings_day.geojson
tippecanoe --layer malaria_building -o malaria_buildings_low.mbtiles --include "@day" --minimum-zoom=0 --maximum-zoom=10 < malaria_buildings_day_centroid.geojson
./patch.sh malaria_buildings_low.mbtiles malaria_buildings.mbtiles
echo "update metadata set value=0 where name = 'minzoom'" | sqlite3 malaria_buildings.mbtiles
rm malaria_buildings_low.mbtiles
```

7. Calculate buildings per day and total unique contributors

```bash
./building-totals.js -i malaria_buildings_day.geojson -o malaria_buildings_by_day.json
./contributor-totals.js -i malaria_buildings_day.geojson -o malaria_contributors.json
```

8. Upload the vector tiles to Mapbox Studio!
