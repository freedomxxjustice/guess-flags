import csv

# твой исходный csv с неправильными description
INPUT_FILE = "ua_regions.csv"

# csv с правильными description (тот, что собрался скриптом)
FIX_FILE = "ukraine_flags.csv"

# выходной файл
OUTPUT_FILE = "ukraine_flags_corrected.csv"

# читаем фиксы
fix_map = {}
with open(FIX_FILE, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        fix_map[row["name"]] = row["description"]

# читаем и обновляем основной
with open(INPUT_FILE, newline="", encoding="utf-8") as f_in, \
     open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f_out:

    reader = csv.DictReader(f_in)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(f_out, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        if row["name"] in fix_map:
            row["description"] = fix_map[row["name"]]
        writer.writerow(row)

print("Готово →", OUTPUT_FILE)
