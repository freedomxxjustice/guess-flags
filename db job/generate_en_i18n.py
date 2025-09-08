import pandas as pd
import json

# путь к твоему CSV
csv_file = "flags080925.csv"
json_file = "en2.json"

# читаем CSV
df = pd.read_csv(csv_file)

# создаём словарь для i18n
translations = {row["name"]: row["name"] for _, row in df.iterrows()}

# сохраняем в JSON
with open(json_file, "w", encoding="utf-8") as f:
    json.dump(translations, f, ensure_ascii=False, indent=2)

print(f"Файл {json_file} успешно создан! 🔥")
