from translate import Translator
import json

translator = Translator(from_lang="en", to_lang="ru")

with open("en2.json", "r", encoding="utf-8") as f:
    en_translations = json.load(f)

ru_translations = {}
for key, value in en_translations.items():
    try:
        translated = translator.translate(value)
    except Exception:
        translated = value
    ru_translations[key] = translated

with open("ru2.json", "w", encoding="utf-8") as f:
    json.dump(ru_translations, f, ensure_ascii=False, indent=2)
 