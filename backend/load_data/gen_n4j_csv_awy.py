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
    "ID": "name",
    "TYPE": "type",
    "D_NEXT_PT": "dNextPt",
    "BEARING": "bearing",
    "SEG_MAG_COURSE": "segmentMagneticCourse",
    "SEG_MAG_COURSE_OPP": "segmentMagneticCourseOpp",
    "D_NEXT_PT_NM": "dNextPtNm",
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
            tl_data = translate_keys(field_names, data)
            tl_data[":TYPE"] = "AIRWAY_ROUTE"
            if f"{awy_id}_{awy_type}" in tl_data_dict:
                tl_data_dict[f"{awy_id}_{awy_type}"].append((awy_seq_num, tl_data))
            else:
                tl_data_dict[f"{awy_id}_{awy_type}"] = [(awy_seq_num, tl_data)]

    # can't guarantee order above so done here:
    routes = []
    for key in tl_data_dict:
        cur_route = tl_data_dict[key]
        cur_route.sort(key=lambda x: x[0])
        cur_route_with_end_id = [cur_route[0][1]] # load first
        for seq_num, vals in cur_route[1:]:
            cur_route_with_end_id[-1][":END_ID"] = vals[":START_ID"]
            cur_route_with_end_id.append(vals)
        cur_route_with_end_id.pop() # remove last one.
        routes.extend(cur_route_with_end_id)

    writer.writerows(routes)