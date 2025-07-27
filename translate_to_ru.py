import json
from deep_translator import GoogleTranslator

# Load your existing en.json file
with open("en.json", "r", encoding="utf-8") as f:
    en_dict = json.load(f)

# Translate each country name to Russian
ru_dict = {
    country: GoogleTranslator(source="en", target="ru").translate(country)
    for country in en_dict
}

# Save to ru.json
with open("ru.json", "w", encoding="utf-8") as f:
    json.dump(ru_dict, f, ensure_ascii=False, indent=2)

print("ru.json created with Russian translations.")
