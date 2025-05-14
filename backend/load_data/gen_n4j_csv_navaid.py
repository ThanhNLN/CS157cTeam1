#!/usr/bin/env python3
import json
import csv

# key map is from: to
def translate_keys(key_map: dict, data: dict) -> dict:
    ret_dict = {}
    for k in key_map:
        if k in data:
            ret_dict[key_map[k]] = data[k]
    return ret_dict


field_names = {
    # FIX
    "ID": "navaidId:ID",
    "STATE": "state",
    "ICAO": "icao",
    "LAT": "latitude:double",
    "LONG": "longitude:double",
    #"TYPE": "fixType",
    "USE": "use",
    "NAS_ID": "nasId",
    "HIGH_ARTCC": "highArtcc",
    "LOW_ARTCC": "lowArtcc",
    "COUNTRY": "country",
    # AWY
    "NAVAID_NAME": "navaidId:ID",
    "NAVAID_TYPE": "navaidType",
    "ICAO_REGION": "icao",
    "NAVAID_LAT": "latitude:double",
    "NAVAID_LONG": "longitude:double",
    "MRA": "mra",
    # APT
    #"TYPE": "aptType",
    "LOCATION_ID": "navaidId:ID",
    "CITY": "city",
    "NAME": "name",
    "LAT": "latitude:double",
    "LONG": "longitude:double",
    "STATUS": "status",
    # Extras
    "EXTRA1": ":LABEL",
}

stardp_fields = {
    "NAVAID_LAT": "latitude:double",
    "NAVAID_LONG": "longitude:double",
    "NAVAID_ID": "navaidId:ID",
}

with open("NAVAID.csv", "w+") as navaid_file:
    writer = csv.DictWriter(navaid_file, set(field_names.values()), restval="", extrasaction="ignore")
    writer.writeheader()

    tl_data_dict = {}
    with open("FIX.json", "r+", encoding="utf-8") as fix_file:
        fix_data = json.load(fix_file)
        for data in fix_data:
            if data["USE"].startswith("MIL-"): continue
            tl_data = translate_keys(field_names, data)
            tl_data["fixType"] = data["TYPE"]
            tl_data[':LABEL'] = 'NAVAID;FIX'
            if tl_data["navaidId:ID"] in tl_data_dict:
                tl_data_dict[tl_data["navaidId:ID"]] = tl_data | tl_data_dict[tl_data["navaidId:ID"]]
            else:
                tl_data_dict[tl_data["navaidId:ID"]] = tl_data
            
    with open("AWY.json", "r+", encoding="utf-8") as awy_file:
        awy_data = json.load(awy_file)
        tl_data_list = []
        for data in awy_data.values():
            tl_data = translate_keys(field_names, data)
            tl_data[':LABEL'] = 'NAVAID;AWY'
            if tl_data["navaidId:ID"] in tl_data_dict:
                if ";AWY" not in tl_data_dict[tl_data["navaidId:ID"]][':LABEL']:
                    tl_data_dict[tl_data["navaidId:ID"]][':LABEL'] += (";AWY")
                tl_data_dict[tl_data["navaidId:ID"]] = tl_data | tl_data_dict[tl_data["navaidId:ID"]]
            else:
                tl_data_dict[tl_data["navaidId:ID"]] = tl_data

    with open("APT.json", "r+", encoding="utf-8") as apt_file:
        apt_data = json.load(apt_file)
        tl_data_list = []
        for data in apt_data:
            tl_data = translate_keys(field_names, data)
            tl_data["aptType"] = data["TYPE"]
            tl_data[':LABEL'] = 'NAVAID;APT'
            if tl_data["navaidId:ID"] in tl_data_dict:
                if ";APT" not in tl_data_dict[tl_data["navaidId:ID"]][':LABEL']:
                    tl_data_dict[tl_data["navaidId:ID"]][':LABEL'] += (";APT")
                tl_data_dict[tl_data["navaidId:ID"]] = tl_data | tl_data_dict[tl_data["navaidId:ID"]]
            else:
                tl_data_dict[tl_data["navaidId:ID"]] = tl_data

    with open("STARDP.json", "r+", encoding="utf-8") as stardp_file:
        stardp_data = json.load(stardp_file)
        for key, data in stardp_data.items():
            for item in data:
                for idx in range(len(item)):
                    route = []
                    for pts in item[idx]:
                        tl_data = translate_keys(stardp_fields, pts)
                        tl_data[":LABEL"] = "NAVAID;STARDP"

                        if tl_data["navaidId:ID"] in tl_data_dict:
                            tl_data_dict[tl_data["navaidId:ID"]] = tl_data | tl_data_dict[tl_data["navaidId:ID"]]
                        else:
                            tl_data_dict[tl_data["navaidId:ID"]] = tl_data
                    
    writer.writerows(tl_data_dict.values())