#!/usr/bin/env bash

echo "Starting conversion"

python3 convert_apt.py
python3 convert_awy.py
python3 convert_fix.py
python3 convert_stardp.py

echo "Generating csv"

python3 gen_n4j_csv_awy.py
python3 gen_n4j_csv_navaid.py

echo "Checking if root"

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

echo "Loading database"

neo4j stop && \
neo4j-admin database import full neo4j --overwrite-destination --nodes=NAVAID.csv --relationships=AIRWAY.csv --verbose && \
neo4j start
