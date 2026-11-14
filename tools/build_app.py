"""Stamp a build id into the game page, the offline worker and version.json.

Run from the repository root after any change to index.html:
    python3 tools/build_app.py
The id is a hash of the page with its own stamp blanked out, so the same page always gets the same id.
The page asks version.json for the latest id and offers "새 버전 받기" when they differ, and the worker
renames its cache so phones drop the old copy.
"""
import hashlib, json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
page = root / 'index.html'
worker = root / 'sw.js'

html = page.read_text(encoding='utf-8')
stamp = re.compile(r"const APP_BUILD = '[^']*';")
if not stamp.search(html):
    raise SystemExit('APP_BUILD line not found in index.html')
build = hashlib.sha1(stamp.sub("const APP_BUILD = 'dev';", html).encode('utf-8')).hexdigest()[:10]
page.write_text(stamp.sub(f"const APP_BUILD = '{build}';", html), encoding='utf-8')

sw = worker.read_text(encoding='utf-8')
worker.write_text(re.sub(r"const VER = '[^']*';", f"const VER = '{build}';", sw), encoding='utf-8')

(root / 'version.json').write_text(json.dumps({'build': build}) + '\n', encoding='utf-8')
print('build', build)
