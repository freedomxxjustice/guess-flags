from bs4 import BeautifulSoup
from datetime import datetime
import csv

html = """<table class="wikitable sortable jquery-tablesorter">
<thead><tr>
<th class="unsortable">Flag</th>
<th colspan="2" class="headerSort" tabindex="0" role="columnheader button" title="Sort ascending">Administrative division</th>
<th class="headerSort" tabindex="0" role="columnheader button" title="Sort ascending">Adopted</th>
<th class="unsortable">Description
</th></tr></thead><tbody>
<tr>
<td><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Flag_of_Minsk,_Belarus.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/6/69/Flag_of_Minsk%2C_Belarus.svg/250px-Flag_of_Minsk%2C_Belarus.svg.png" decoding="async" width="150" height="100" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/6/69/Flag_of_Minsk%2C_Belarus.svg/330px-Flag_of_Minsk%2C_Belarus.svg.png 2x" data-file-width="1800" data-file-height="1200"></a></span></td>
<td><span data-sort-value="Minsk&nbsp;!"><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Minsk_in_Belarus.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Minsk_in_Belarus.svg/120px-Minsk_in_Belarus.svg.png" decoding="async" width="100" height="89" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Minsk_in_Belarus.svg/250px-Minsk_in_Belarus.svg.png 1.5x" data-file-width="1623" data-file-height="1447"></a></span></span></td>
<td><a href="/wiki/Minsk" title="Minsk">Minsk City</a></td>
<td>2001</td>
<td>Blue with the Minsk Coat of Arms of 1591 in the center.
</td></tr>
<tr>
<td><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Flag_of_Brest_Voblast,_Belarus.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Flag_of_Brest_Voblast%2C_Belarus.svg/250px-Flag_of_Brest_Voblast%2C_Belarus.svg.png" decoding="async" width="150" height="75" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Flag_of_Brest_Voblast%2C_Belarus.svg/330px-Flag_of_Brest_Voblast%2C_Belarus.svg.png 2x" data-file-width="500" data-file-height="250"></a></span></td>
<td><span data-sort-value="Brest Region&nbsp;!"><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Brest_Voblast_in_Belarus.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/9/97/Brest_Voblast_in_Belarus.svg/120px-Brest_Voblast_in_Belarus.svg.png" decoding="async" width="100" height="89" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/9/97/Brest_Voblast_in_Belarus.svg/250px-Brest_Voblast_in_Belarus.svg.png 1.5x" data-file-width="1623" data-file-height="1447"></a></span></span></td>
<td><a href="/wiki/Brest_Region" class="mw-redirect" title="Brest Region">Brest Region</a></td>
<td>2004</td>
<td>Blue with a yellow zoubre (Bison bonasus) on a red stylized tower (coat of arms of the Region of Brest).
</td></tr>
<tr>
<td><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Flag_of_Homyel_Voblast.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Homyel_Voblast.svg/250px-Flag_of_Homyel_Voblast.svg.png" decoding="async" width="150" height="75" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Homyel_Voblast.svg/330px-Flag_of_Homyel_Voblast.svg.png 2x" data-file-width="800" data-file-height="400"></a></span></td>
<td><span data-sort-value="Gomel Region&nbsp;!"><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Homiel_Voblast_in_Belarus.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Homiel_Voblast_in_Belarus.svg/120px-Homiel_Voblast_in_Belarus.svg.png" decoding="async" width="100" height="89" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Homiel_Voblast_in_Belarus.svg/250px-Homiel_Voblast_in_Belarus.svg.png 1.5x" data-file-width="1623" data-file-height="1447"></a></span></span></td>
<td><a href="/wiki/Gomel_Region" class="mw-redirect" title="Gomel Region">Gomel Region</a></td>
<td>2005</td>
<td>Green with the coat of arms of the Region of Homyel (Gomel) (only in the centre of an obverse side of the flag). Ratio: 1:2.
</td></tr>
<tr>
<td><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Flag_of_Hrodna_Voblasts.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Flag_of_Hrodna_Voblasts.svg/250px-Flag_of_Hrodna_Voblasts.svg.png" decoding="async" width="150" height="75" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Flag_of_Hrodna_Voblasts.svg/330px-Flag_of_Hrodna_Voblasts.svg.png 2x" data-file-width="600" data-file-height="300"></a></span></td>
<td><span data-sort-value="Grodno Region&nbsp;!"><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Hrodna_Voblast_in_Belarus.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Hrodna_Voblast_in_Belarus.svg/120px-Hrodna_Voblast_in_Belarus.svg.png" decoding="async" width="100" height="89" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Hrodna_Voblast_in_Belarus.svg/250px-Hrodna_Voblast_in_Belarus.svg.png 1.5x" data-file-width="1623" data-file-height="1447"></a></span></span></td>
<td><a href="/wiki/Grodno_Region" class="mw-redirect" title="Grodno Region">Grodno Region</a></td>
<td>2007</td>
<td>Red with the coat of arms of the Region of Hrodna (only in the centre of an obverse side of the flag). Ratio 1:2
</td></tr>
<tr>
<td><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Flag_of_Mahilyow_Voblast.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Mahilyow_Voblast.svg/250px-Flag_of_Mahilyow_Voblast.svg.png" decoding="async" width="150" height="75" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Mahilyow_Voblast.svg/330px-Flag_of_Mahilyow_Voblast.svg.png 2x" data-file-width="2200" data-file-height="1100"></a></span></td>
<td><span data-sort-value="Mogilev Region&nbsp;!"><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Mahilou_Voblast_in_Belarus.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Mahilou_Voblast_in_Belarus.svg/120px-Mahilou_Voblast_in_Belarus.svg.png" decoding="async" width="100" height="89" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Mahilou_Voblast_in_Belarus.svg/250px-Mahilou_Voblast_in_Belarus.svg.png 1.5x" data-file-width="1623" data-file-height="1447"></a></span></span></td>
<td><a href="/wiki/Mogilev_Region" class="mw-redirect" title="Mogilev Region">Mogilev Region</a></td>
<td>2005</td>
<td>Red with the coat of arms of the Region of Mogilyov (only in the centre of an obverse side of the flag). Ratio: 1:2.
</td></tr>
<tr>
<td><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Flag_of_Minsk_Voblast.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_Minsk_Voblast.svg/250px-Flag_of_Minsk_Voblast.svg.png" decoding="async" width="150" height="75" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_Minsk_Voblast.svg/330px-Flag_of_Minsk_Voblast.svg.png 2x" data-file-width="600" data-file-height="300"></a></span></td>
<td><span data-sort-value="Minsk Region&nbsp;!"><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Minsk_Voblast_in_Belarus.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Minsk_Voblast_in_Belarus.svg/120px-Minsk_Voblast_in_Belarus.svg.png" decoding="async" width="100" height="89" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Minsk_Voblast_in_Belarus.svg/250px-Minsk_Voblast_in_Belarus.svg.png 1.5x" data-file-width="1623" data-file-height="1447"></a></span></span></td>
<td><a href="/wiki/Minsk_Region" class="mw-redirect" title="Minsk Region">Minsk Region</a></td>
<td>2007</td>
<td>Red with the coat of arms of the Region of Minsk (only in the centre of an obverse side of the flag). Ratio 1:2
</td></tr>
<tr>
<td><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Flag_of_Vitsebsk_region.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Flag_of_Vitsebsk_region.svg/250px-Flag_of_Vitsebsk_region.svg.png" decoding="async" width="150" height="75" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Flag_of_Vitsebsk_region.svg/330px-Flag_of_Vitsebsk_region.svg.png 2x" data-file-width="800" data-file-height="400"></a></span></td>
<td><span data-sort-value="Vitebsk Region&nbsp;!"><span class="mw-image-border" typeof="mw:File"><a href="/wiki/File:Vitsebsk_Voblast_in_Belarus.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Vitsebsk_Voblast_in_Belarus.svg/120px-Vitsebsk_Voblast_in_Belarus.svg.png" decoding="async" width="100" height="89" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Vitsebsk_Voblast_in_Belarus.svg/250px-Vitsebsk_Voblast_in_Belarus.svg.png 1.5x" data-file-width="1623" data-file-height="1447"></a></span></span></td>
<td><a href="/wiki/Vitebsk_Region" class="mw-redirect" title="Vitebsk Region">Vitebsk Region</a></td>
<td>2009</td>
<td>Green with the coat of arms of the Region of Vitsebsk (only in the centre of an obverse side of the flag). Ratio 1:2
</td></tr></tbody><tfoot></tfoot></table>"""  # вставь сюда весь HTML, который прислал

soup = BeautifulSoup(html, "html.parser")
table = soup.find("table", class_="wikitable")

rows = table.find_all("tr")[1:]  # пропускаем заголовок

csv_filename = "belarus_flags.csv"
start_id = 364
created_at = datetime.now().isoformat()

with open(csv_filename, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
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

    current_id = start_id
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 5:
            continue

        # name из третьего столбца
        name = cols[2].get_text(strip=True)
        # description — последний столбец
        description = "oblast"
        # image — первый <img> из первого столбца
        img_tag = cols[0].find("img")
        image = "https:" + img_tag["src"] if img_tag else ""

        writer.writerow(
            [
                current_id,
                name,
                description,
                0.0,
                image,
                "",
                created_at,
                0,
                0,
                "by_regions",
            ]
        )
        current_id += 1

print(f"CSV сохранён: {csv_filename}")
