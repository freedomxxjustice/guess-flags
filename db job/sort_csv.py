import pandas as pd

# читаем файл
df = pd.read_csv("flags110925.csv")

# сортируем по колонке "id"
df_sorted = df.sort_values(by="id")

# сохраняем в новый файл
df_sorted.to_csv("flags110925_sorted.csv", index=False)

print("Готово! Файл сохранён как flags110925_sorted.csv")
