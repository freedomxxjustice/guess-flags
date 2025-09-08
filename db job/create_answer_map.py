import json

# Загружаем en.json (или свой источник с названиями стран)
with open("en2.json", "r", encoding="utf-8") as f:
    en_data = json.load(f)

# Загружаем ru.json (готовый перевод)
with open("ru2.json", "r", encoding="utf-8") as f:
    ru_data = json.load(f)

# Словарь для кастомных исключений (сокращения, разговорные варианты и т.д.)
custom_aliases = {
    "united states": ["usa", "us", "сша", "соединенные штаты"],
    "south africa": ["юар"],
    "central african republic": ["цар", "центрально африканская республика"],
    "czech republic": ["czechia", "чехия"],
    "united kingdom": ["uk", "великобритания"],
    "Autonomous Oblast": ["AO", "АО", "ао", "ao"],
    "Autonomous Okrug": ["AO", "АО", "ао", "ao"],
}

answer_map = {}

for key, en_value in en_data.items():
    ru_value = ru_data.get(key, "")

    # английский
    answer_map[en_value.lower()] = en_value
    # русский
    if ru_value:
        answer_map[ru_value.lower()] = en_value

    # если есть алиасы
    if en_value.lower() in custom_aliases:
        for alias in custom_aliases[en_value.lower()]:
            answer_map[alias.lower()] = en_value

# Сохраняем
with open("answer_map.json", "w", encoding="utf-8") as f:
    json.dump(answer_map, f, ensure_ascii=False, indent=2)

print("✅ answer_map.json готов")
