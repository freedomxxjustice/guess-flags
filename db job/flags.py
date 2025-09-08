import csv
import requests
from bs4 import BeautifulSoup

# --- Настройки ---
csv_file = "countries_parsed.csv"
output_file = "countries_flags_updated.csv"
flagpedia_url = "https://flagpedia.net/index"
flag_base_url = "https://flagpedia.net"  # для абсолютных ссылок на изображения
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/139.0.0.0 Safari/537.36"
}

# --- Парсим Flagpedia ---
response = requests.get(flagpedia_url, headers=HEADERS)
soup = BeautifulSoup(response.text, "html.parser")

flag_dict = {}
for li in soup.select("ul.flag-grid li a"):
    country_name = li.find("span").text.strip()
    img_tag = li.find("img")
    if img_tag and img_tag.has_attr("src"):
        img_src = img_tag["src"]
        if img_src.startswith("/"):
            img_src = flag_base_url + img_src
        flag_dict[country_name] = img_src

print(f"Найдено флагов: {len(flag_dict)}")

# --- Обновляем CSV ---
rows = []
with open(csv_file, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row["name"]
        if name in flag_dict:
            row["image"] =  f'"{flag_dict[name]}"'
        rows.append(row)

# --- Записываем новый CSV ---
with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=reader.fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"CSV обновлён и сохранён как {output_file}")
