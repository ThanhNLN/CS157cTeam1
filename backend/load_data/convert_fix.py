#!/usr/bin/env python3

import sys
import json
import math

# Convert from degrees, minutes, seconds to floats
def latlong_conv(s: str) -> float:
    deg, min, sec_dir = s.split("-")
    sec  = sec_dir[0:-1]
    dir = sec_dir[-1:]
    val = (float(deg) + float(min)/60 + float(sec)/(60*60)) * (-1 if dir in ['W', 'S'] else 1)
    return (math.floor(val * 10**6) / 10**6) # we don't need *that* much precision

data = []
with open("FIX.txt", "r+", encoding="ISO8859-1") as faa_data:
    for line in faa_data:
        line_item = {}
        if line.startswith("FIX1"):
            line_item["ID"] = line[4:34].rstrip().strip()
            line_item["STATE"] = line[34:64].rstrip().strip()
            line_item["ICAO"] = line[64:66].rstrip().strip()
            line_item["LAT"] = latlong_conv(line[66:80].rstrip().strip())
            line_item["LONG"] = latlong_conv(line[80:94].rstrip().strip())
            line_item["TYPE"] = line[94:97].rstrip().strip()
            line_item["USE"] = line[213:228].rstrip().strip()
            line_item["NAS_ID"] = line[228:233].rstrip().strip()
            line_item["HIGH_ARTCC"] = line[233:237].rstrip().strip()
            line_item["LOW_ARTCC"] = line[237:241].rstrip().strip()
            line_item["COUNTRY"] = line[241:271].rstrip().strip()
            data.append(line_item)

with open("FIX.json", "w+", encoding="utf-8") as json_output:
    json_output.write(json.dumps(data))