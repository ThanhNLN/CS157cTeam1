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

data = {}
with open("AWY.txt", "r+", encoding="ISO8859-1") as faa_data:
    for line in faa_data:
        line_item = {}
        if line.startswith("AWY1"):
            line_item["ID"] = line[4:9].rstrip().strip()
            line_item["TYPE"] = line[9:10].rstrip().strip()
            line_item["SEQ_NUM"] = line[10:15].rstrip().strip()
            line_item["EFFECTIVE"] = fix_datetime(line[15:25].rstrip().strip())
            line_item["TRACK_OUT"] = line[25:32].rstrip().strip()
            line_item["D_CHANGEOVER"] = line[32:37].rstrip().strip()
            line_item["TRACK_IN"] = line[37:44].rstrip().strip()
            line_item["D_NEXT_PT"] = line[44:50].rstrip().strip()
            line_item["BEARING"] = line[50:56].rstrip().strip()
            line_item["SEG_MAG_COURSE"] = line[56:62].rstrip().strip()
            line_item["SEG_MAG_COURSE_OPP"] = line[62:68].rstrip().strip()
            line_item["D_NEXT_PT_NM"] = line[68:74].rstrip().strip()
            line_item["MEA"] = line[74:79].rstrip().strip()
            line_item["MEA_DIR"] = line[79:85].rstrip().strip()
            line_item["MEA_OPP"] = line[85:90].rstrip().strip()
            line_item["MEA_DIR_OPP"] = line[90:96].rstrip().strip()
            line_item["MAX_ALT"] = line[96:101].rstrip().strip()
            line_item["MOCA"] = line[101:106].rstrip().strip()
            line_item["D_CHANGEOVER_NAVAID"] = line[107:110].rstrip().strip()
            line_item["MIN_CROSS_ALT"] = line[110:115].rstrip().strip()
            line_item["CROSS_DIR"] = line[115:122].rstrip().strip()
            line_item["MIN_CROSS_ALT_OPP"] = line[122:127].rstrip().strip()
            line_item["CROSS_DIR_OPP"] = line[127:134].rstrip().strip()
            line_item["NAVAID_ARTCC"] = line[141:144].rstrip().strip()
            line_item["GNSS_MEA"] = line[217:222].rstrip().strip()
            line_item["GNSS_MEA_DIR"] = line[222:228].rstrip().strip()
            line_item["GNSS_MEA_OPP"] = line[228:233].rstrip().strip()
            line_item["GNSS_MEA_DIR_OPP"] = line[233:239].rstrip().strip()
            line_item["MCA_PT"] = line[239:279].rstrip().strip()
            line_item["DME_MEA"] = line[279:284].rstrip().strip()
            line_item["DME_MEA_DIR"] = line[284:290].rstrip().strip()
            line_item["DME_MEA_OPP"] = line[290:295].rstrip().strip()
            line_item["DME_MEA_DIR_OPP"] = line[295:301].rstrip().strip()
        elif line.startswith("AWY2"):
            line_item["ID"] = line[4:9].rstrip().strip()
            line_item["TYPE"] = line[9:10].rstrip().strip()
            line_item["SEQ_NUM"] = line[10:15].rstrip().strip()
            line_item["NAVAID_NAME"] = line[15:45].rstrip().strip()
            line_item["NAVAID_TYPE"] = line[45:64].rstrip().strip()
            line_item["ICAO_REGION"] = line[81:83].rstrip().strip()
            line_item["NAVAID_LAT"] = latlong_conv(line[83:97].rstrip().strip())
            line_item["NAVAID_LONG"] = latlong_conv(line[97:111].rstrip().strip())
            line_item["MRA"] = line[111:116].rstrip().strip()
        # remove fields that are not present.
        to_delete = []
        for k in line_item:
            if not line_item[k]:
                to_delete.append(k)
        for k in to_delete:
            if k == "TYPE": continue # Used to generate unique key, skip
            if k == "D_NEXT_PT_NM": continue # Used to find end of route
            del line_item[k]
        if line_item:
            k = f"{line_item['ID']}_{line_item['TYPE']}_{line_item['SEQ_NUM']}"
            if k in data:
                data[k] = data[k] | line_item
            else:
                data[k] = line_item

with open("AWY.json", "w+", encoding="utf-8") as json_output:
    json_output.write(json.dumps(data))