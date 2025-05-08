import json

d = {}
with open("AWY.json", "r+", encoding="utf-8") as awy_file:
    awy_data = json.load(awy_file)
    for v in awy_data.values():
        for k in v:
            d[k] = ""

print(d.keys())