#!/usr/bin/env python3

import sys
import json
import math
import datetime


# Convert from degrees, minutes, seconds to floats
def latlong_conv(s: str) -> float:
    if not s:
        return ""
    deg, min, sec_dir = s.split("-")
    sec  = sec_dir[0:-1]
    dir = sec_dir[-1:]
    val = (float(deg) + float(min)/60 + float(sec)/(60*60)) * (-1 if dir in ['W', 'S'] else 1)
    return (math.floor(val * 10**6) / 10**6) # we don't need *that* much precision

def fix_datetime(s: str) -> str:
    return datetime.datetime.strptime(s, "%m/%d/%Y").strftime("%Y-%m-%d")

data = []
with open("APT.txt", "r+", encoding="ISO8859-1") as faa_data:
    for line in faa_data:
        line_item = {}
        if line.startswith("APT"):
            line_item["ID"] = line[3:14].rstrip().strip()
            line_item["TYPE"] = line[14:27].rstrip().strip()
            line_item["LOCATION_ID"] = line[27:31].rstrip().strip()
            line_item["EFFECTIVE"] = fix_datetime(line[31:41].rstrip().strip())
            line_item["FAA_REGION"] = line[41:44].rstrip().strip()
            line_item["CITY"] = line[93:133].rstrip().strip()
            line_item["NAME"] = line[133:183].rstrip().strip()
            line_item["LAT"] = latlong_conv(line[523:538].rstrip().strip())
            line_item["LONG"] = latlong_conv(line[550:565].rstrip().strip())
            line_item["STATUS"] = line[840:842].rstrip().strip()
        # remove fields that are not present.
        to_delete = []
        for k in line_item:
            if not line_item[k]:
                to_delete.append(k)
        for k in to_delete:
            del line_item[k]
        if line_item:
            data.append(line_item)

with open("APT.json", "w+", encoding="utf-8") as json_output:
    json_output.write(json.dumps(data))