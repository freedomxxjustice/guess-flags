import json

# Load translations
with open("en.json", "r", encoding="utf-8") as f:
    en = json.load(f)

with open("ru.json", "r", encoding="utf-8") as f:
    ru = json.load(f)

# Build the answer map
answer_map = {}

for key in en:
    canonical = en[key]
    answer_map[key.lower()] = canonical
    ru_name = ru.get(key)
    if ru_name:
        answer_map[ru_name.lower()] = canonical

# Save to answer_map.py
with open("answer_map.py", "w", encoding="utf-8") as f:
    f.write("answer_map = " + json.dumps(answer_map, ensure_ascii=False, indent=2))

print("✅ answer_map.py created.")
