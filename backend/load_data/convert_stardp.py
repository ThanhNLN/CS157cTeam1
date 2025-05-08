#!/usr/bin/env python3

import sys
import json
import math
import datetime
from enum import Enum


# Convert from degrees, minutes, seconds to floats
def latlong_conv(s: str) -> float:
    if not s:
        return ""
    deg = s[1:3]
    min = s[3:5]
    sec = s[5:8]
    dir = s[0]
    val = (float(deg) + float(min)/60 + float(sec)/(60*60)) * (-1 if dir in ['W', 'S'] else 1)
    return (math.floor(val * 10**6) / 10**6) # we don't need *that* much precision

def fix_datetime(s: str) -> str:
    return datetime.datetime.strptime(s, "%m/%d/%Y").strftime("%Y-%m-%d")

class ParseState(Enum):
    NEW = 0
    ROUTE = 1
    APT = 2
    TRANSITION = 3

data = {}
last_pt = {"ID": "", "TYPE": ""}
last_computer_code = ""
parse_state = ParseState.NEW
route_idx = 0
temp_data = {}

with open("STARDP.txt", "r+", encoding="ISO8859-1") as faa_data:
    for line in faa_data:
        line_item = {}
        if line[0] in ["S", "D"]:
            line_item["ID"] = line[0:5].rstrip().strip()
            line_item["TYPE"] = line[10:12].rstrip().strip()
            line_item["NAVAID_LAT"] = latlong_conv(line[13:21].rstrip().strip())
            line_item["NAVAID_LONG"] = latlong_conv(line[21:30].rstrip().strip())
            line_item["NAVAID_ID"] = line[30:36].rstrip().strip()
            line_item["STARDP_CODE"] = line[38:51].rstrip().strip()
            line_item["TRANSITION_NAME"] = line[51:161].rstrip().strip()
            line_item["AIRWAY_IDENT"] = line[161:223].rstrip().strip()

            
            # remove fields that are not present.
            to_delete = []
            for k in line_item:
                if not line_item[k]:
                    to_delete.append(k)
            for k in to_delete:
                del line_item[k]

            if last_pt["ID"] != line_item["ID"]:
                parse_state = ParseState.NEW
                route_idx = 0
                # if line_item["ID"][0] == "S":
                #     data[line_item["ID"]] = ([[line_item]], [[]]) # route, airport
                # elif line_item["ID"][0] == "D":
                data[line_item["ID"]] = ([], [], []) # route, airport, post-transition pts
                temp_data = {}
                temp_data[line_item["ID"]] = ([line_item], [], []) # route, airport, post-transition pts


            # elif line_item["ID"][0] == "S":
            #     if line_item["TYPE"] in ["R", "P"] and parse_state in [ParseState.NEW, ParseState.ROUTE]:
            #         parse_state = ParseState.ROUTE
            #         data[line_item["ID"]][0][route_idx].append(line_item)
            #     elif line_item["TYPE"] in ["R", "P"] and parse_state == ParseState.APT:
            #         route_idx += 1
            #         data[line_item["ID"]][0].append([])
            #         data[line_item["ID"]][1].append([])
            #         parse_state = ParseState.ROUTE
            #         data[line_item["ID"]][0][route_idx].append(line_item)
            #     elif line_item["TYPE"] == "AA" and parse_state in [ParseState.NEW, ParseState.ROUTE, ParseState.APT]:
            #         parse_state = ParseState.APT
            #         data[line_item["ID"]][1][route_idx].append(line_item)

            # elif line_item["ID"][0] == "D":
            else:
                if "STARDP_CODE" in line_item:
                    parse_state = ParseState.NEW
                    if last_pt["TYPE"] == "AA":
                        data[last_pt["ID"]][0].append(temp_data[last_pt["ID"]][0])
                        data[last_pt["ID"]][1].append(temp_data[last_pt["ID"]][1])
                    else:
                        data[last_pt["ID"]][2].append(temp_data[last_pt["ID"]][0])
                        
                    temp_data[line_item["ID"]] = ([], [], []) # route, airport, post-transition pts
                if line_item["TYPE"] not in "AA" and parse_state in [ParseState.NEW, ParseState.ROUTE]:
                    parse_state = ParseState.ROUTE
                    temp_data[line_item["ID"]][0].append(line_item)
                elif line_item["TYPE"] not in ["AA"] and parse_state == ParseState.APT:
                    parse_state = ParseState.ROUTE
                elif line_item["TYPE"] == "AA" and parse_state in [ParseState.NEW, ParseState.ROUTE, ParseState.APT]:
                    temp_data[line_item["ID"]][1].append(line_item)

            last_pt = line_item

# commit last
if last_pt["TYPE"] == "AA":
    data[last_pt["ID"]][0].append(temp_data[last_pt["ID"]][0])
    data[last_pt["ID"]][1].append(temp_data[last_pt["ID"]][1])
else:
    data[last_pt["ID"]][2].append(temp_data[last_pt["ID"]][0])



with open("STARDP.json", "w+", encoding="utf-8") as json_output:
    json_output.write(json.dumps(data))