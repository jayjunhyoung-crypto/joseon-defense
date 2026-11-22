"""Build index.html from src/ and stamp the build id.

    python3 tools/build.py          build, stamp, syntax-check
    python3 tools/build.py --sim    also write tools/sim/core.js for the balance bots

src/page.html        the page, with @@PEERJS@@ and @@GAME@@ where the two scripts go
src/vendor/          PeerJS, inlined so the page works as one file
src/parts/ORDER      the order the game parts are joined in, inside one function
src/parts/*.js       the game: a_core is the rules, b* art, c* drawing, d events, e sound,
                     f progression, g interface, h friend play and the phone app
"""
import hashlib, json, pathlib, re, subprocess, sys

root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
parts_dir = src / 'parts'
order = [x.strip() for x in (parts_dir / 'ORDER').read_text(encoding='utf-8').split('\n') if x.strip()]
head = (parts_dir / '_head.js').read_text(encoding='utf-8')
tail = (parts_dir / '_tail.js').read_text(encoding='utf-8')
game = head + '\n' + ''.join((parts_dir / f'{nm}.js').read_text(encoding='utf-8') for nm in order) + tail
peer = (src / 'vendor/peerjs.min.js').read_text(encoding='utf-8')
page = (src / 'page.html').read_text(encoding='utf-8')
assert page.count('@@PEERJS@@') == 1 and page.count('@@GAME@@') == 1
html = page.replace('@@PEERJS@@', peer).replace('@@GAME@@', game)

# stamp: a hash of the page with its own stamp blanked out
stamp = re.compile(r"const APP_BUILD = '[^']*';")
assert stamp.search(html), 'APP_BUILD line missing'
build = hashlib.sha1(stamp.sub("const APP_BUILD = 'dev';", html).encode('utf-8')).hexdigest()[:10]
html = stamp.sub(f"const APP_BUILD = '{build}';", html)
(root / 'index.html').write_text(html, encoding='utf-8')
sw = (root / 'sw.js').read_text(encoding='utf-8')
(root / 'sw.js').write_text(re.sub(r"const VER = '[^']*';", f"const VER = '{build}';", sw), encoding='utf-8')
(root / 'version.json').write_text(json.dumps({'build': build}) + '\n', encoding='utf-8')

# syntax check the game script
tmp = root / 'tools' / '.check.js'
tmp.write_text(game, encoding='utf-8')
r = subprocess.run(['node', '--check', str(tmp)], capture_output=True, text=True)
tmp.unlink()
if r.returncode:
    print(r.stderr[:2000]); sys.exit(1)

if '--sim' in sys.argv:
    # the rules alone, for the headless balance bots
    simdir = root / 'tools' / 'sim'; simdir.mkdir(exist_ok=True)
    core = (parts_dir / 'a_core.js').read_text(encoding='utf-8')
    names = ['TYPES', 'TYPE_IX', 'MYTHS', 'MYTH_BY', 'STAGES', 'BAL', 'TIERS', 'GUTS', 'PITY_MAX', 'ROSTER', 'ULTS', 'CHALS', 'LUCK', 'LUCK_MAX', 'UP_MAX', 'UP_NAMES', 'NCELL', 'LAST_WAVE',
             'makeState', 'newGame', 'update', 'summon', 'summonCost', 'mergeAt', 'canMergeAt', 'gamble', 'gutP', 'craft', 'recipeState', 'upgrade', 'upCost', 'luckByHon',
             'emptyCells', 'hasRoom', 'popOf', 'popFull', 'capOf', 'sell', 'charm', 'callChallenge', 'chalReady', 'applyLevels', 'dmgOf', 'hpAt', 'mythOpen', 'poolOf', 'summonOdds', 'COOP', 'AI', 'JOINT', 'noRelics', 'moneyMul', 'paySafe', 'safeCap', 'DESTS', 'destOf', 'destParty', 'startExp', 'expTick', 'partyRatio', 'SEASONS', 'applySeason', 'COMBOS', 'comboFire', 'comboLive', 'comboReady', 'jointAward', 'jointRoll', 'jointOdds', 'expDps', 'partyDps', 'caveFloor', 'applyHits', 'syncGhosts', 'aiNew', 'aiStep', 'aiSyncMe', 'aiThink']
    exports = ', '.join(names)
    (simdir / 'core.js').write_text("'use strict';\n" + core + "\nmodule.exports = { get G() { return G; }, setG: g => { G = g; }, " + exports + " };\n", encoding='utf-8')

print('build', build, 'bytes', len(html.encode('utf-8')))
