import csv
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re

# --- Настройки ---
wiki_url = "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_and_their_capitals_in_native_languages"
output_file = "countries_parsed.csv"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/115.0 Safari/537.36"
}


# --- Функции ---
def clean_text(text):
    """Удаляет ссылки вида [10], лишние пробелы и переносы строк"""
    text = re.sub(r"\[\d+\]", "", text)
    return text.strip()


# --- Получаем страницу ---
response = requests.get(wiki_url, headers=HEADERS)
soup = BeautifulSoup(response.text, "html.parser")

countries_data = []
id_counter = 1
current_time = datetime.now().isoformat(sep=" ", timespec="seconds")

for table in soup.find_all("table", {"class": "wikitable"}):
    for row in table.find_all("tr")[1:]:
        cols = row.find_all("td")
        if not cols:
            continue

        name_cell = cols[0]
        name = clean_text(name_cell.get_text())

        # Определяем тип описания по форматированию
        if name_cell.find("b") and name_cell.find("i"):  # bold italics
            description = "partial-recognition"
        elif name_cell.find("b"):  # bold
            description = "UN"
        elif name_cell.find("i"):  # italics
            description = "dependent"
        else:
            description = "other"

        # Флаг (из <img>) — можно оставить ссылку
        flag_url = ""
        img_tag = row.find("img")
        if img_tag and img_tag.has_attr("src"):
            flag_url = "https:" + img_tag["src"]

        countries_data.append(
            [
                id_counter,
                name,
                description,
                0,  # difficulty
                flag_url,
                "",  # emoji пусто
                current_time,
                0,  # total_shown
                0,  # total_correct
                "country",
            ]
        )
        id_counter += 1

# --- Записываем CSV ---
with open(output_file, "w", newline="", encoding="utf-8") as f:
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

print(f"Готово! {len(countries_data)} стран записано в {output_file}")
