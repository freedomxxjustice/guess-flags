import pandas as pd
import json

# Load the CSV file
df = pd.read_csv("flags.csv")

# Extract unique country names
country_names = df['name'].dropna().unique()

# Create dictionary with "name": "name"
en_dict = {name: name for name in country_names}

# Save to en.json
with open("en.json", "w", encoding="utf-8") as f:
    json.dump(en_dict, f, ensure_ascii=False, indent=2)

print("en.json generated successfully.")
