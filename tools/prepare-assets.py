from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import zipfile, io, json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'photos'
OUT.mkdir(parents=True, exist_ok=True)
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
items = []
with zipfile.ZipFile(r'C:\Users\quint\Downloads\Running Pics-20261111T094848Z-1-001.zip') as z:
    for n in z.namelist():
        if Path(n).suffix.lower() not in ['.jpg', '.jpeg', '.webp', '.png']: continue
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(z.read(n)))).convert('RGB')
        index = len(items) + 1
        thumb = ImageOps.contain(im, (215, 155))
        items.append((n, thumb, index))
        im.thumbnail((1800, 1800))
        im.save(OUT / f'run-{index:02}.webp', 'WEBP', quality=83)
sheet = Image.new('RGB', (1200, ((len(items) + 4)//5)*205), '#f5f4ee')
d = ImageDraw.Draw(sheet)
for i, (name, im, index) in enumerate(items):
    x, y = (i%5)*240, (i//5)*205
    sheet.paste(im, (x, y))
    d.text((x+3, y+158), f'{index:02} {Path(name).parent.name}', fill='#18352c')
    d.text((x+3, y+174), Path(name).name[:30], fill='#18352c')
sheet.save(ART / 'contact-sheet.jpg')
(ROOT / 'assets' / 'photo-credits.json').write_text(json.dumps([{'file': f'photos/run-{i:02}.webp', 'source': n} for n, _, i in items], indent=2))
print(f'Prepared {len(items)} photographs')
