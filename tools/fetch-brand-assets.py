from pathlib import Path
import urllib.request, re, html
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'brands'
OUT.mkdir(parents=True, exist_ok=True)
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=40).read()
for name, url in [('burnt', 'https://burnt.co.za/'), ('openfuel', 'https://za.openfuel.com/'), ('saucony', 'https://www.saucony.com/en/home')]:
    try:
        source = get(url).decode()
        (ROOT / 'artifacts' / f'{name}-source.html').write_text(source, encoding='utf-8')
        matches = re.findall(r'(?:src|srcset)=[\"\']([^\"\']*(?:logo|Logo|LOGO)[^\"\']*)', source)
        print(name, '\n'.join(dict.fromkeys(matches))[:6000])
    except Exception as e: print(name, str(e))
get_url = 'https://images.unsplash.com/photo-1543858393-d5307eb2cdc7?auto=format&fit=crop&w=2400&q=88'
(ROOT / 'assets' / 'landscape.jpg').write_bytes(get(get_url))
print('Landscape downloaded')
for name, url in [
    ('burnt.png', 'https://burnt.co.za/cdn/shop/files/BURNT-STUDIOS-WINGS-LOGO-WHITE.png?v=1724074825&width=600'),
    ('openfuel.png', 'https://za.openfuel.com/cdn/shop/files/OpenFuel_FullLogo_Orange_900h.png?v=1782654325&width=600'),
    ('saucony.svg', 'https://www.saucony.com/on/demandware.static/Sites-saucony_us-Site/-/default/dwcd8f7065/images/logo.svg')
]:
    (OUT / name).write_bytes(get(url))
    print('Saved', name)
fonts = ROOT / 'assets' / 'fonts'
fonts.mkdir(exist_ok=True)
css = get('https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@400;500;600;700&display=swap').decode()
print(css[:500])
for i, url in enumerate(dict.fromkeys(re.findall(r'url\((https:[^)]+)\)', css))):
    filename = f'bai-{i}.woff2' if '.woff2' in url else f'bai-{i}.ttf'
    (fonts / filename).write_bytes(get(url))
    css = css.replace(url, f'./{filename}')
(fonts / 'fonts.css').write_text(css)
(fonts / 'OFL.txt').write_bytes(get('https://raw.githubusercontent.com/google/fonts/main/ofl/baijamjuree/OFL.txt'))
