#!/usr/bin/env python3

import sys
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
    "ID": "name:string[]",
    "TYPE": "type",
    "D_NEXT_PT": "dNextPt",
    "BEARING": "bearing",
    "SEG_MAG_COURSE": "segmentMagneticCourse",
    "SEG_MAG_COURSE_OPP": "segmentMagneticCourseOpp",
    "D_NEXT_PT_NM": "dNextPtNm",
    "D_NEXT_PT_NM": "distance:double",
    "MEA": "mea",
    "MEA_DIR_OPP": "meaDirOpp",
    "MAX_ALT": "maxAlt",
    "MOCA": "moca",
    "CROSS_DIR": "crossDir",
    "CROSS_DIR_OPP": "crossDirOpp",
    "GNSS_MEA_DIR_OPP": "gnssMeaDiropp",
    "NAVAID_NAME": ":START_ID",
    "DME_MEA_DIR_OPP": "dmeMeaDirOpp",
    "NAVAID_ARTCC": "navaidArtcc",
    "ICAO_REGION": "icao",
    "D_CHANGEOVER_NAVAID": "dChangeoverNavaid",
    "MRA": "mra",
    "MIN_CROSS_ALT": "minCrossAlt",
    "MCA_PT": "mcaPt",
    "GNSS_MEA": "gnssMea",
    "DME_MEA": "dmeMea",
    "MEA_DIR": "meaDir",
    "MEA_OPP": "meaOpp",
    "MIN_CROSS_ALT_OPP": "minCrossAltOpp",
    "TRACK_OUT": "trackOut",
    "TRACK_IN": "trackIn",
    "GNSS_MEA_DIR": "gnssMeaDir",
    "GNSS_MEA_OPP": "gnssMeaOpp",
    # Extras
    "EXTRA1": ":END_ID",
    "EXTRA2": ":TYPE"
}

stardp_fields = {
    "ID": "name:string[]",
    "TYPE": "type",
    # "NAVAID_LAT": "latitudeFrom",
    # "NAVAID_LONG": "longitudeFrom",
    "NAVAID_ID": ":START_ID",
    "STARDP_CODE": "stardpCode",
    "TRANSITION_NAME": "transitionName",
    "AIRWAY_IDENT": "airwayIdent",
}

with open("AIRWAY.csv", "w+") as airway_file:
    writer = csv.DictWriter(
        airway_file, set(field_names.values()), restval="", extrasaction="ignore"
    )
    writer.writeheader()
    with open("AWY.json", "r+", encoding="utf-8") as awy_file:
        awy_data = json.load(awy_file)
        tl_data_dict = {}
        for key, data in awy_data.items():
            awy_id, awy_type, awy_seq_num_str = key.split("_") # self-defined
            awy_seq_num = int(awy_seq_num_str)
            data["D_NEXT_PT_NM"] = float(data["D_NEXT_PT_NM"]) if data["D_NEXT_PT_NM"] else ""
            if not data["D_NEXT_PT_NM"]:
                data["D_NEXT_PT_NM"] = float(data["D_NEXT_PT"]) if data["D_NEXT_PT"] else ""
            if not data["D_NEXT_PT_NM"]:
                data["D_NEXT_PT_NM"] = 5.00 # some weight
            tl_data = translate_keys(field_names, data)
            tl_data[":TYPE"] = "AIRWAY_ROUTE"
            if f"{awy_id}_{awy_type}" in tl_data_dict:
                tl_data_dict[f"{awy_id}_{awy_type}"].append((awy_seq_num, tl_data))
            else:
                tl_data_dict[f"{awy_id}_{awy_type}"] = [(awy_seq_num, tl_data)]

    # can't guarantee order above so done here:
    routes = {}
    for key in tl_data_dict:
        cur_route = tl_data_dict[key]
        cur_route.sort(key=lambda x: x[0])
        cur_route_with_end_id = [cur_route[0][1]] # load first
        for seq_num, vals in cur_route[1:]:
            cur_route_with_end_id[-1][":END_ID"] = vals[":START_ID"]
            cur_route_with_end_id.append(vals)
        cur_route_with_end_id.pop() # remove last one.
        for r in cur_route_with_end_id:
            if f"{r[':START_ID']}_{r[':END_ID']}" not in routes:
                routes[f"{r[':START_ID']}_{r[':END_ID']}"] = r
            elif r["name:string[]"] not in routes[f"{r[':START_ID']}_{r[':END_ID']}"]["name:string[]"]:
                routes[f"{r[':START_ID']}_{r[':END_ID']}"]["name:string[]"] += ";" + r["name:string[]"]

    with open("STARDP.json", "r+", encoding="utf-8") as stardp_file:
        stardp_data = json.load(stardp_file)
        for key, data in stardp_data.items():
            basic, apt, extra = data

            basic_list = []
            for idx in range(len(basic)):
                route = []
                for pts in basic[idx]:
                    tl_basic = translate_keys(stardp_fields, pts)
                    tl_basic[":TYPE"] = "AIRWAY_ROUTE"
                    route.append(tl_basic)

                for idx2 in range(len(route)-1):
                    if f"{route[idx2][':START_ID']}_{route[idx2+1][':START_ID']}" not in routes:
                        route[idx2]["distance:double"] = "1.00"
                        route[idx2][":END_ID"] = route[idx2+1][':START_ID']
                        routes[f"{route[idx2][':START_ID']}_{route[idx2+1][':START_ID']}"] = route[idx2]
                    elif route[idx2]["name:string[]"] not in routes[f"{route[idx2][':START_ID']}_{route[idx2+1][':START_ID']}"]["name:string[]"]:
                        routes[f"{route[idx2][':START_ID']}_{route[idx2+1][':START_ID']}"]["name:string[]"] += ";" + route[idx2]["name:string[]"]
                for aa in apt[idx]:
                    tl_aa = translate_keys(stardp_fields, aa)
                    # print(route)
                    if route[-1]["name:string[]"][0] == "S":
                        if f"{route[-1][':START_ID']}_{tl_aa[':START_ID']}" not in routes:
                            route[-1]["distance:double"] = "1.00"
                            route[-1][":END_ID"] = tl_aa[':START_ID']
                            routes[f"{route[-1][':START_ID']}_{tl_aa[':START_ID']}"] = route[-1]
                        elif route[-1]["name:string[]"] not in routes[f"{route[-1][':START_ID']}_{tl_aa[':START_ID']}"]["name:string[]"]:
                            routes[f"{route[-1][':START_ID']}_{tl_aa[':START_ID']}"]["name:string[]"] += ";" + route[-1]["name:string[]"]
                    else: # departure
                        if f"{tl_aa[':START_ID']}_{route[0][':START_ID']}" not in routes:
                            route[0]["distance:double"] = "1.00"
                            route[0][":END_ID"] = tl_aa[':START_ID']
                            routes[f"{tl_aa[':START_ID']}_{route[0][':START_ID']}"] = route[0]
                        elif route[0]["name:string[]"] not in routes[f"{tl_aa[':START_ID']}_{route[0][':START_ID']}"]["name:string[]"]:
                            routes[f"{tl_aa[':START_ID']}_{route[0][':START_ID']}"]["name:string[]"] += ";" + route[0]["name:string[]"]
                for idx2 in range(len(extra)):
                    route2 = []
                    for pts in extra[idx2]:
                        tl_extra = translate_keys(stardp_fields, pts)
                        tl_extra[":TYPE"] = "AIRWAY_ROUTE"
                        route2.append(tl_extra)
                    for idx3 in range(len(route2)-1):
                        if f"{route2[idx3][':START_ID']}_{route2[idx3+1][':START_ID']}" not in routes:
                            route2[idx3]["distance:double"] = "1.00"
                            route2[idx3][":END_ID"] = route2[idx3+1][':START_ID']
                            routes[f"{route2[idx3][':START_ID']}_{route2[idx3+1][':START_ID']}"] = route2[idx3]
                        elif route2[idx3]["name:string[]"] not in routes[f"{route2[idx3][':START_ID']}_{route2[idx3+1][':START_ID']}"]["name:string[]"]:
                            routes[f"{route2[idx3][':START_ID']}_{route2[idx3+1][':START_ID']}"]["name:string[]"] += ";" + route2[idx3]["name:string[]"]

                    # if tl_extra["name:string[]"][0] == "S":
                    #     if f"{route2[-1][':START_ID']}_{route[0][':START_ID']}" not in routes:
                    #         route2[-1]["distance:double"] = "1.00"
                    #         route2[-1][":END_ID"] = route[0][':START_ID']
                    #         routes[f"{route2[-1][':START_ID']}_{route[0][':START_ID']}"] = route2[-1]
                    #     elif route2[-1]["name:string[]"] not in routes[f"{route2[-1][':START_ID']}_{route[0][':START_ID']}"]["name:string[]"]:
                    #         routes[f"{route2[-1][':START_ID']}_{route[0][':START_ID']}"]["name:string[]"] += ";" + route[-1]["name:string[]"]
    writer.writerows(routes.values())