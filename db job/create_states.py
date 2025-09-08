import requests
from bs4 import BeautifulSoup
import csv
import re
from datetime import datetime, timezone, timedelta

URL = "https://en.wikipedia.org/wiki/List_of_U.S._state_flags"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/115.0 Safari/537.36"
}

US_STATES = {
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
}


def normalize_name(raw_text: str) -> str:
    t = raw_text.strip()
    # remove parenthesis e.g. "Georgia (U.S. state)" -> "Georgia"
    t = re.sub(r"\s*\(.*\)\s*$", "", t)
    # remove " ", "Flag and seal of ", etc.
    t = re.sub(r"^[Ff]lag(?: and [^ ]+)? of\s+", "", t)
    # remove leading "the "
    t = re.sub(r"^[Tt]he\s+", "", t)
    # remove "State of " / "Commonwealth of "
    t = re.sub(r"^(State|Commonwealth) of\s+", "", t)
    return t.strip()


def is_reverse_tag(li_tag) -> bool:
    # check hrefs and img src for 'reverse'
    a = li_tag.find("a", href=True)
    if a and "reverse" in a["href"].lower():
        return True
    img = li_tag.find("img")
    if img:
        for attr in ("src", "data-src", "srcset", "alt", "title"):
            val = img.get(attr, "")
            if val and "reverse" in val.lower():
                return True
    # also check gallerytext text for "(reverse)"
    g = li_tag.find("div", class_="gallerytext")
    if g and "reverse" in g.get_text(" ", strip=True).lower():
        return True
    return False


def main():
    r = requests.get(URL, headers=HEADERS, timeout=15)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    items = soup.find_all("li", class_="gallerybox")
    rows = []
    seen = set()
    now = datetime.now(timezone(timedelta(hours=3))).isoformat()  # +03:00

    id_counter = 1
    for li in items:
        # skip reverse images explicitly
        if is_reverse_tag(li):
            continue

        # name: обычно в div.gallerytext > a
        name_text = ""
        g = li.find("div", class_="gallerytext")
        if g:
            a = g.find("a")
            if a:
                name_text = a.get_text(strip=True)

        # fallback: try img alt/title
        if not name_text:
            img = li.find("img")
            if img:
                name_text = img.get("alt", "").strip() or img.get("title", "").strip()

        if not name_text:
            continue

        name = normalize_name(name_text)
        if name not in US_STATES:
            continue  # фильтруем только 50 штатов

        if name in seen:
            continue  # уже добавили (на случай дублей)
        seen.add(name)

        img = li.find("img")
        if not img:
            continue
        src = img.get("src") or img.get("data-src") or ""
        # prefer srcset higher-res? (optional)
        if not src:
            srcset = img.get("srcset", "")
            if srcset:
                # взять первый url из srcset
                src = srcset.split(",")[0].strip().split(" ")[0]

        if not src:
            continue

        if src.startswith("//"):
            img_url = "https:" + src
        elif src.startswith("/"):
            img_url = "https://en.wikipedia.org" + src
        else:
            img_url = src

        row = {
            "id": id_counter,
            "name": name,
            "description": "US State",
            "difficulty": 0.0,
            "image": img_url,
            "emoji": "",
            "created_at": now,
            "total_shown": 0,
            "total_correct": 0,
            "category": "us_state",
        }
        rows.append(row)
        id_counter += 1

    # Проверка: должно быть 50 штатов
    print(f"Найдено строк: {len(rows)} (ожидается 50)")

    with open("us_state_flags.csv", "w", newline="", encoding="utf-8") as f:
        fieldnames = [
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
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    print("CSV сохранён как us_state_flags.csv")


if __name__ == "__main__":
    main()
