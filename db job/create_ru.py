import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime

URL = "https://en.wikipedia.org/wiki/Flags_of_the_federal_subjects_of_Russia"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/115.0 Safari/537.36"
}

response = requests.get(URL, headers=HEADERS)
soup = BeautifulSoup(response.text, "html.parser")

flags_data = []

now_iso = datetime.now().isoformat()

for heading_div in soup.select("div.mw-heading3"):
    section_title = heading_div.find("h3").get_text(strip=True).lower()
    
    # Определяем тип субъекта: republic, krai, oblast и т.д.
    if "republic" in section_title:
        region_type = "republic"
    elif "krai" in section_title:
        region_type = "krai"
    elif "oblast" in section_title:
        region_type = "oblast"
    elif "federal city" in section_title:
        region_type = "federal city"
    elif "autonomous okrug" in section_title:
        region_type = "autonomous okrug"
    elif "autonomous oblast" in section_title:
        region_type = "autonomous oblast"
    else:
        region_type = "region"

    gallery = heading_div.find_next("ul", class_="gallery")
    if not gallery:
        continue

    for li in gallery.find_all("li", class_="gallerybox"):
        title_tag = li.select_one(".gallerytext a")
        name = title_tag.get_text(strip=True) if title_tag else ""

        # Дата из br
        date_tag = li.select_one(".gallerytext br")
        date_text = date_tag.next_sibling.strip() if date_tag and date_tag.next_sibling else ""

        description = region_type

        img_tag = li.select_one("img")
        img_url = "https:" + img_tag["src"] if img_tag and img_tag.get("src") else ""

        flags_data.append({
            "id": "",
            "name": name,
            "description": description,
            "difficulty": 0.0,
            "image": img_url,
            "emoji": "",
            "created_at": now_iso,
            "total_shown": 0,
            "total_correct": 0,
            "category": "ru_subjects"
        })

with open("russia_flags.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["id","name","description","difficulty","image","emoji",
                                           "created_at","total_shown","total_correct","category"])
    writer.writeheader()
    for flag in flags_data:
        writer.writerow(flag)

print(f"Всего флагов собрано: {len(flags_data)}")
