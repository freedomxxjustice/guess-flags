import csv
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re

old_csv = "countries_parsed.csv"
new_csv = "countries_new.csv"
wiki_url = "https://en.wikipedia.org/wiki/List_of_national_flags_of_sovereign_states"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/139.0.0.0 Safari/537.36"
}

# --- Загружаем старый CSV для description ---
description_dict = {}
with open(old_csv, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        description_dict[row["name"]] = row["description"]

# --- Парсим Википедию ---
response = requests.get(wiki_url, headers=HEADERS)
soup = BeautifulSoup(response.text, "html.parser")

countries_data = []
id_counter = 1
created_at = datetime.now().isoformat(sep=" ", timespec="seconds")

# Проходим по всем таблицам с флагами
for table in soup.find_all("table", {"class": "wikitable"}):
    for row in table.find_all("tr"):
        th_tag = row.find("th")
        img_tag = row.find("img")
        if not th_tag or not img_tag:
            continue  # пропускаем строки без названия или без флага

        name = re.sub(r"\[\d+\]", "", th_tag.get_text()).strip()

        # фильтруем заголовки и странные строки
        if len(name) < 2 or "flag" in name.lower() or "note" in name.lower():
            continue

        image_url = "https:" + img_tag["src"]

        description = description_dict.get(name, "")

        countries_data.append(
            [
                id_counter,
                name,
                description,
                0,
                image_url,
                "",
                created_at,
                0,
                0,
                "country",
            ]
        )
        id_counter += 1


# --- Сохраняем новый CSV ---
with open(new_csv, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(
        [
            "id",
            "name",
            "description",
            "difficulty",
            "image",
            "emoji",
            "created_at",
            "total_shown",
            "total_correct",
            "category",
        ]
    )
    writer.writerows(countries_data)

print(f"Готово! {len(countries_data)} стран записано в {new_csv}")
