#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

function merge() {
    local source="$1"
    local dest="$2"

    echo "Patch $source => $dest ..."
    echo "
    PRAGMA journal_mode=PERSIST;
    PRAGMA page_size=80000;
    PRAGMA synchronous=OFF;
    ATTACH DATABASE '$source' AS source;
    REPLACE INTO map SELECT * FROM source.map;
    REPLACE INTO images SELECT * FROM source.images;"\
    | sqlite3 $dest

    echo "Removing $source"
    rm "$source"
}

function download_files() {
    echo 'Downloading Zimbabwe'
    wget https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/zimbabwe.mbtiles.gz
    echo 'Downloading Zambia'
    wget https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/zambia.mbtiles.gz
    echo 'Downloading Botswana'
    wget https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/botswana.mbtiles.gz
    echo 'Downloading Laos'
    wget https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/laos.mbtiles.gz
    echo 'Downloading Cambodia'
    wget https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/cambodia.mbtiles.gz
    echo 'Downloading Honduras'
    wget https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/honduras.mbtiles.gz
    echo 'Downloading Guatemala'
    wget https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/guatemala.mbtiles.gz

    echo 'Unzipping extracts'
    gunzip *.gz

    echo 'Merging extracts'
    local dest="malaria.qa.mbtiles"
    cp zambia.mbtiles "$dest"

    merge zambia.mbtiles "$dest"
    merge zimbabwe.mbtiles "$dest"
    merge botswana.mbtiles "$dest"
    merge laos.mbtiles "$dest"
    merge cambodia.mbtiles "$dest"
    merge honduras.mbtiles "$dest"
    merge guatemala.mbtiles "$dest"

    echo "Prepared source extract $dest"
}

download_files
