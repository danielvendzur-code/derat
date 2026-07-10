from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old in text:
        return text.replace(old, new, 1)
    if new in text:
        return text
    raise SystemExit(f'Nenajdeny blok: {label}')

index_path = Path('index.html')
text = index_path.read_text(encoding='utf-8')

old_pick = """  pickSub(id,el){state.c.sub=id;cleanAddons();this._markOne('sub',el);const wrap=$('dr-ine-wrap');if(wrap)wrap.innerHTML=id==='ine'?rIne():'';this._livePrice();},"""
new_pick = """  pickSub(id,el){state.c.sub=id;cleanAddons();this._markOne('sub',el);const wrap=$('dr-ine-wrap');if(wrap)wrap.innerHTML=id==='ine'?rIne():'';
    const body=calc.querySelector('.dr-body');if(body){const shouldScroll=id==='ine';body.classList.toggle('can-scroll',shouldScroll);body.classList.toggle('no-scroll',!shouldScroll);body.scrollTop=0;requestAnimationFrame(()=>scrollHint(body));}
    this._livePrice();},"""
text = replace_once(text, old_pick, new_pick, 'pickSub scroll toggle')

# Remove the calculator icon from the standalone teaser markup.
text, count = re.subn(
    r'\n\s*<span class="dr-teaser-ic"><svg.*?</svg></span>',
    '',
    text,
    count=1,
    flags=re.S,
)
if count == 0 and 'class="dr-teaser-ic"' in text:
    raise SystemExit('Ikona interneho teaseru sa nepodarila odstranit.')

text = replace_once(
    text,
    '.dr-teaser-row{display:flex;gap:12px;align-items:center;padding-right:16px}',
    '.dr-teaser-row{display:block;padding-right:16px}',
    'internal teaser layout',
)
text = re.sub(r'\n\.dr-teaser-ic\{[^\n]*\}\n\.dr-teaser-ic svg\{[^\n]*\}', '', text, count=1)

index_path.write_text(text, encoding='utf-8')

embed_path = Path('embed.html')
embed = embed_path.read_text(encoding='utf-8')

# Remove icon-specific CSS and simplify the teaser to text only.
embed = re.sub(r'\n\s*#derat-teaser \.dt-row\{[^\n]*\}', '', embed, count=1)
embed = re.sub(r'\n\s*#derat-teaser \.dt-ic\{[^\n]*\}', '', embed, count=1)
embed = re.sub(r'\n\s*#derat-teaser \.dt-ic svg\{[^\n]*\}', '', embed, count=1)
embed = re.sub(r'\n\s*#derat-teaser \.dt-copy\{[^\n]*\}', '', embed, count=1)

old_embed = '''  <div class="dt-row">
    <span class="dt-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 4v3h10V6H7Zm0 5v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Zm-8 4v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z"/></svg></span>
    <div class="dt-copy">
      <div class="dt-tt">Zistite cenu zásahu na počkanie</div>
      <div class="dt-tx">Otvorte <b>kalkulačku</b> — orientačnú cenu deratizácie či dezinsekcie máte do minúty. Poradí aj náš <b>AI asistent</b>.</div>
    </div>
  </div>'''
new_embed = '''  <div class="dt-tt">Zistite cenu zásahu na počkanie</div>
  <div class="dt-tx">Otvorte <b>kalkulačku</b> — orientačnú cenu deratizácie či dezinsekcie máte do minúty. Poradí aj náš <b>AI asistent</b>.</div>'''
embed = replace_once(embed, old_embed, new_embed, 'external teaser markup')

embed_path.write_text(embed, encoding='utf-8')

# Hard validation of the actual bug and requested visual cleanup.
final_index = index_path.read_text(encoding='utf-8')
final_embed = embed_path.read_text(encoding='utf-8')
assert "body.classList.toggle('can-scroll',shouldScroll)" in final_index
assert "body.classList.toggle('no-scroll',!shouldScroll)" in final_index
assert 'class="dr-teaser-ic"' not in final_index
assert 'class="dt-ic"' not in final_embed
