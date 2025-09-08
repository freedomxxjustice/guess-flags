import csv

input_file = 'ukraine_flags.csv'   # исходный файл
output_file = 'ukraine_flags_numbered.csv' # файл с обновлёнными ID
start_id = 337           # начальный ID

with open(input_file, newline='', encoding='utf-8') as csv_in:
    reader = list(csv.reader(csv_in))  # читаем все строки

# первая строка — заголовок, оставляем без изменений
header, rows = reader[0], reader[1:]

# нумеруем начиная со второй строки
for index, row in enumerate(rows):
    if row:  # проверка, что строка не пустая
        row[0] = str(start_id + index)

# записываем обратно в тот же файл
with open(output_file, 'w', newline='', encoding='utf-8') as csv_out:
    writer = csv.writer(csv_out)
    writer.writerow(header)  # пишем заголовок
    writer.writerows(rows)

print(f"Готово! ID обновлены в {output_file}")