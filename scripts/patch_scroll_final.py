from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old in text:
        return text.replace(old, new, 1)
    if new in text:
        return text
    raise SystemExit(f'Nenajdeny blok: {label}')

index_path = Path('index.html')
text = index_path.read_text(encoding='utf-8')

text = replace_once(
    text,
    ".dr-body.can-scroll{min-height:0;overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:26px!important;scrollbar-width:thin;scrollbar-color:rgba(41,115,115,.48) transparent;scrollbar-gutter:stable;touch-action:pan-y}",
    ".dr-body.can-scroll{flex:1 1 0;height:0;min-height:0;max-height:100%;position:relative;overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:26px!important;scrollbar-width:thin;scrollbar-color:rgba(41,115,115,.48) transparent;scrollbar-gutter:stable;touch-action:pan-y;-webkit-overflow-scrolling:touch}",
    'can-scroll sizing',
)

text = replace_once(
    text,
    "  <div class=\"dr-body ${last||(k==='sub'&&state.c.sub==='ine')?'can-scroll':'no-scroll'}\">",
    "  <div class=\"dr-body ${last||k==='sub'?'can-scroll':'no-scroll'}\" tabindex=\"0\">",
    'sub step always scrollable',
)

old_pick = """  pickSub(id,el){state.c.sub=id;cleanAddons();this._markOne('sub',el);const wrap=$('dr-ine-wrap');if(wrap)wrap.innerHTML=id==='ine'?rIne():'';
    const body=calc.querySelector('.dr-body');if(body){const shouldScroll=id==='ine';body.classList.toggle('can-scroll',shouldScroll);body.classList.toggle('no-scroll',!shouldScroll);body.scrollTop=0;requestAnimationFrame(()=>scrollHint(body));}
    this._livePrice();},"""
new_pick = """  pickSub(id,el){state.c.sub=id;cleanAddons();this._markOne('sub',el);const wrap=$('dr-ine-wrap');if(wrap)wrap.innerHTML=id==='ine'?rIne():'';
    const body=calc.querySelector('.dr-body');if(body){body.classList.add('can-scroll');body.classList.remove('no-scroll');requestAnimationFrame(()=>{scrollHint(body);if(id==='ine')body.scrollTo({top:body.scrollHeight,behavior:'smooth'});else body.scrollTop=0;});}
    this._livePrice();},"""
text = replace_once(text, old_pick, new_pick, 'pickSub auto reveal')

index_path.write_text(text, encoding='utf-8')

embed_path = Path('embed.html')
embed = embed_path.read_text(encoding='utf-8')
embed = embed.replace(' allow="clipboard-write" scrolling="no" loading="eager"', ' allow="clipboard-write" loading="eager"', 1)
embed_path.write_text(embed, encoding='utf-8')

final = index_path.read_text(encoding='utf-8')
assert "last||k==='sub'?'can-scroll':'no-scroll'" in final
assert "height:0;min-height:0;max-height:100%" in final
assert "body.scrollTo({top:body.scrollHeight,behavior:'smooth'})" in final
assert 'scrolling="no"' not in embed_path.read_text(encoding='utf-8')
