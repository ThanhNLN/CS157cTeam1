#!/usr/bin/env python3

import sys
import json
import csv
import importlib.util

from math import sin, cos, sqrt, atan2, radians

HAS_GEOPY = False
geopy_loader = importlib.util.find_spec('geopy')
if geopy_loader is not None:
    import geopy.distance
    HAS_GEOPY = True


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
    "NAVAID_LAT": "latitudeFrom",
    "NAVAID_LONG": "longitudeFrom",
    "EXTRA1": ":END_ID",
    "EXTRA2": ":TYPE",
    "EXTRA3": "midpointLatitude:double",
    "EXTRA4": "midpointLongitude:double",
    "EXTRA5": "distanceWeatherCost:double",
    "EXTRA6": "fromNavaid",
    "EXTRA7": "toNavaid",
}

stardp_fields = {
    "ID": "name:string[]",
    "TYPE": "type",
    "NAVAID_LAT": "latitudeFrom",
    "NAVAID_LONG": "longitudeFrom",
    "NAVAID_ID": ":START_ID",
    "STARDP_CODE": "stardpCode",
    "TRANSITION_NAME": "transitionName",
    "AIRWAY_IDENT": "airwayIdent",
}


def calc_dist(p1, p2):
    if HAS_GEOPY:
        return geopy.distance.distance((p1["latitudeFrom"], p1["longitudeFrom"]), (p2["latitudeFrom"], p2["longitudeFrom"])).nm
    else:
        R = 3443.8 # nautical miles

        lat1 = radians(p1["latitudeFrom"])
        lon1 = radians(p1["longitudeFrom"])
        lat2 = radians(p2["latitudeFrom"])
        lon2 = radians(p2["longitudeFrom"])
        
        dlon = lon2 - lon1
        dlat = lat2 - lat1

        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        distance = R * c

        return distance


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
                data["D_NEXT_PT_NM"] = -1
            if "NAVAID_ID" in data and data["NAVAID_ID"]:
                data["NAVAID_NAME"] = data["NAVAID_ID"]
            tl_data = translate_keys(field_names, data)
            if tl_data[":START_ID"] in ["U.S. MEXICAN BORDER", "U.S. CANADIAN BORDER", "U.S.CANADIAN BORDER"]: continue
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
            cur_route_with_end_id[-1]["midpointLatitude:double"] = (cur_route_with_end_id[-1]["latitudeFrom"] + vals["latitudeFrom"]) / 2
            cur_route_with_end_id[-1]["midpointLongitude:double"] = (cur_route_with_end_id[-1]["longitudeFrom"] + vals["longitudeFrom"]) / 2
            if cur_route_with_end_id[-1]["distance:double"] == -1:
                cur_route_with_end_id[-1]["distance:double"] = calc_dist(cur_route_with_end_id[-1], vals)
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
                        route[idx2]["distance:double"] = calc_dist(route[idx2], route[idx2+1])#"1.00"
                        route[idx2][":END_ID"] = route[idx2+1][':START_ID']
                        route[idx2]["midpointLatitude:double"] = (route[idx2]["latitudeFrom"] + route[idx2+1]["latitudeFrom"]) / 2
                        route[idx2]["midpointLongitude:double"] = (route[idx2]["longitudeFrom"] + route[idx2+1]["longitudeFrom"]) / 2
                        routes[f"{route[idx2][':START_ID']}_{route[idx2+1][':START_ID']}"] = route[idx2].copy()
                    elif route[idx2]["name:string[]"] not in routes[f"{route[idx2][':START_ID']}_{route[idx2+1][':START_ID']}"]["name:string[]"]:
                        routes[f"{route[idx2][':START_ID']}_{route[idx2+1][':START_ID']}"]["name:string[]"] += ";" + route[idx2]["name:string[]"]
                for aa in apt[idx]:
                    tl_aa = translate_keys(stardp_fields, aa)
                    # print(route)
                    if route[-1]["name:string[]"][0] == "S": # arrival
                        if f"{route[-1][':START_ID']}_{tl_aa[':START_ID']}" not in routes:
                            route[-1]["distance:double"] = calc_dist(route[-1], tl_aa) #"1.00"
                            route[-1][":END_ID"] = tl_aa[':START_ID']
                            route[-1]["midpointLatitude:double"] = (route[-1]["latitudeFrom"] + tl_aa["latitudeFrom"]) / 2
                            route[-1]["midpointLongitude:double"] = (route[-1]["longitudeFrom"] + tl_aa["longitudeFrom"]) / 2
                            routes[f"{route[-1][':START_ID']}_{tl_aa[':START_ID']}"] = route[-1].copy()
                        elif route[-1]["name:string[]"] not in routes[f"{route[-1][':START_ID']}_{tl_aa[':START_ID']}"]["name:string[]"]:
                            routes[f"{route[-1][':START_ID']}_{tl_aa[':START_ID']}"]["name:string[]"] += ";" + route[-1]["name:string[]"]
                    else: # departure
                        if f"{tl_aa[':START_ID']}_{route[0][':START_ID']}" not in routes:
                            route[0]["distance:double"] = calc_dist(tl_aa, route[0]) #"1.00"
                            route[0][":END_ID"] = tl_aa[':START_ID']
                            route[0]["midpointLatitude:double"] = (route[0]["latitudeFrom"] + tl_aa["latitudeFrom"]) / 2
                            route[0]["midpointLongitude:double"] = (route[0]["longitudeFrom"] + tl_aa["longitudeFrom"]) / 2
                            routes[f"{tl_aa[':START_ID']}_{route[0][':START_ID']}"] = route[0].copy()
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
                            route2[idx3]["distance:double"] = calc_dist(route2[idx3], route2[idx3+1]) # "1.00"
                            route2[idx3][":END_ID"] = route2[idx3+1][':START_ID']
                            route2[idx3]["midpointLatitude:double"] = (route2[idx3]["latitudeFrom"] + route2[idx3+1]["latitudeFrom"]) / 2
                            route2[idx3]["midpointLongitude:double"] = (route2[idx3]["longitudeFrom"] + route2[idx3+1]["longitudeFrom"]) / 2
                            routes[f"{route2[idx3][':START_ID']}_{route2[idx3+1][':START_ID']}"] = route2[idx3].copy()
                        elif route2[idx3]["name:string[]"] not in routes[f"{route2[idx3][':START_ID']}_{route2[idx3+1][':START_ID']}"]["name:string[]"]:
                            routes[f"{route2[idx3][':START_ID']}_{route2[idx3+1][':START_ID']}"]["name:string[]"] += ";" + route2[idx3]["name:string[]"]

                    # if tl_extra["name:string[]"][0] == "S":
                    #     if f"{route2[-1][':START_ID']}_{route[0][':START_ID']}" not in routes:
                    #         route2[-1]["distance:double"] = "1.00"
                    #         route2[-1][":END_ID"] = route[0][':START_ID']
                    #         routes[f"{route2[-1][':START_ID']}_{route[0][':START_ID']}"] = route2[-1]
                    #     elif route2[-1]["name:string[]"] not in routes[f"{route2[-1][':START_ID']}_{route[0][':START_ID']}"]["name:string[]"]:
                    #         routes[f"{route2[-1][':START_ID']}_{route[0][':START_ID']}"]["name:string[]"] += ";" + route[-1]["name:string[]"]
    for route in routes:
        routes[route]["distanceWeatherCost:double"] = routes[route]["distance:double"] # fix issues
        routes[route]["fromNavaid"] = routes[route][":START_ID"]
        routes[route]["toNavaid"] = routes[route][":END_ID"]
    writer.writerows(routes.values())