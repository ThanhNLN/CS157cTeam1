#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

neo4j stop
neo4j-admin database import full neo4j --overwrite-destination --nodes=NAVAID.csv --relationships=AIRWAY.csv
neo4j start