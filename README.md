# malaria-elimination
Visualize the mapping efforts of HOT and DigitalGlobe support of Malaria Elimination

## Workflow

1. Download OSM QA tiles for the following regions
- [Zimbabwe](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/zimbabwe.mbtiles.gz)
- [Zambia](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/zambia.mbtiles.gz)
- [Botswana](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/botswana.mbtiles.gz)
- [Laos](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/laos.mbtiles.gz)
- [Cambodia](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/cambodia.mbtiles.gz)
- [Honduras](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/honduras.mbtiles.gz)
- [Guatemala](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/guatemala.mbtiles.gz)

2. Filter buildings using osm-filter-extract


3. Calculate centroids of all the buildings
4. Encode vector tiles
