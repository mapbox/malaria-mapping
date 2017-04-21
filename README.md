# malaria-elimination

Visualize the mapping efforts of HOT and DigitalGlobe support of Malaria Elimination

## Workflow

1. Prepare the QA tiles extract for the affected regions

```bash
./download-extract.sh
```

2. Filter buildings using osm-filter-extract


3. Calculate centroids of all the buildings
4. Encode vector tiles
