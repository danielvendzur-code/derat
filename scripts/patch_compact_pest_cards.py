from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old in text:
        return text.replace(old, new, 1)
    if new in text:
        return text
    raise SystemExit(f'Nenajdeny blok: {label}')


path = Path('index.html')
text = path.read_text(encoding='utf-8')

text = replace_once(
    text,
    ".dr-grid.tri{grid-template-columns:1fr 1fr!important;gap:12px!important}\n.dr-grid.tri>*:last-child:nth-child(odd){grid-column:1/-1}\n.dr-grid.tri .dr-scard{min-height:116px!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px}\n.dr-grid.tri .dr-scard-ic{width:54px!important;height:50px!important}\n.dr-grid.tri .dr-scard-ic svg{width:50px!important;height:50px!important}\n.dr-grid.tri .dr-scard b{font-size:13px!important}",
    ".dr-grid.tri{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}\n.dr-grid.tri .dr-scard{min-height:74px!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:7px 4px!important;border-radius:15px!important}\n.dr-grid.tri .dr-scard-ic{width:32px!important;height:30px!important}\n.dr-grid.tri .dr-scard-ic svg{width:30px!important;height:30px!important}\n.dr-grid.tri .dr-scard b{font-size:10.8px!important;line-height:1.12!important;text-align:center}",
    'compact three-column pest cards',
)

text = replace_once(
    text,
    "  <div class=\"dr-body ${last||k==='sub'?'can-scroll':'no-scroll'}\" tabindex=\"0\">",
    "  <div class=\"dr-body ${last||(k==='sub'&&state.c.sub==='ine')?'can-scroll':'no-scroll'}\" tabindex=\"0\">",
    'scroll only when Iné is selected',
)

old_pick = """  pickSub(id,el){state.c.sub=id;cleanAddons();this._markOne('sub',el);const wrap=$('dr-ine-wrap');if(wrap)wrap.innerHTML=id==='ine'?rIne():'';
    const body=calc.querySelector('.dr-body');if(body){body.classList.add('can-scroll');body.classList.remove('no-scroll');requestAnimationFrame(()=>{scrollHint(body);if(id==='ine')body.scrollTo({top:body.scrollHeight,behavior:'smooth'});else body.scrollTop=0;});}
    this._livePrice();},"""
new_pick = """  pickSub(id,el){state.c.sub=id;cleanAddons();this._markOne('sub',el);const wrap=$('dr-ine-wrap');if(wrap)wrap.innerHTML=id==='ine'?rIne():'';
    const body=calc.querySelector('.dr-body');if(body){const shouldScroll=id==='ine';body.classList.toggle('can-scroll',shouldScroll);body.classList.toggle('no-scroll',!shouldScroll);requestAnimationFrame(()=>{scrollHint(body);if(shouldScroll)body.scrollTo({top:body.scrollHeight,behavior:'smooth'});else body.scrollTop=0;});}
    this._livePrice();},"""
text = replace_once(text, old_pick, new_pick, 'conditional pest-step scrolling')

path.write_text(text, encoding='utf-8')

final = path.read_text(encoding='utf-8')
assert "repeat(3,minmax(0,1fr))" in final
assert "min-height:74px" in final
assert "last||(k==='sub'&&state.c.sub==='ine')" in final
assert "const shouldScroll=id==='ine'" in final
