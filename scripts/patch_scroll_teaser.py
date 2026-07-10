from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old in text:
        return text.replace(old, new, 1)
    if new in text:
        return text
    raise SystemExit(f"Missing expected block: {label}")


index_path = Path("index.html")
text = index_path.read_text(encoding="utf-8")
text = replace_once(
    text,
    ".dr-teaser-row{display:flex;gap:12px;align-items:flex-start;padding-right:16px}",
    ".dr-teaser-row{display:flex;gap:12px;align-items:center;padding-right:16px}",
    "internal teaser alignment",
)
text = replace_once(
    text,
    ".dr-body{flex:1;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:0 13px 8px}",
    ".dr-body{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:0 13px 8px}",
    "scrolling flex child",
)
text = replace_once(
    text,
    ".dr-body.can-scroll{overflow:auto!important}",
    ".dr-body.can-scroll{min-height:0;overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:26px!important;scrollbar-width:thin;scrollbar-color:rgba(41,115,115,.48) transparent;scrollbar-gutter:stable;touch-action:pan-y}\n"
    ".dr-body.can-scroll::-webkit-scrollbar{width:6px}\n"
    ".dr-body.can-scroll::-webkit-scrollbar-track{background:transparent}\n"
    ".dr-body.can-scroll::-webkit-scrollbar-thumb{background:rgba(41,115,115,.42);border-radius:999px}\n"
    ".dr-body.can-scroll::-webkit-scrollbar-thumb:hover{background:rgba(41,115,115,.62)}",
    "visible scroll area",
)
text = replace_once(
    text,
    ".dr-actions{display:flex;gap:10px;padding:10px 13px 12px;border-top:1px solid var(--line);background:#fff;align-items:center}",
    ".dr-actions{display:flex;flex:0 0 auto;position:relative;z-index:8;gap:10px;padding:10px 13px 12px;border-top:1px solid var(--line);background:#fff;align-items:center}",
    "fixed calculator footer",
)
index_path.write_text(text, encoding="utf-8")

embed_path = Path("embed.html")
embed = embed_path.read_text(encoding="utf-8")
css_anchor = "  #derat-teaser.derat-show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}\n"
css_block = (
    "  #derat-teaser .dt-row{display:flex;align-items:center;gap:12px}\n"
    "  #derat-teaser .dt-ic{flex:0 0 48px;width:48px;height:48px;border-radius:14px;background:#297373;display:flex;align-items:center;justify-content:center;box-shadow:0 7px 16px rgba(41,115,115,.24)}\n"
    "  #derat-teaser .dt-ic svg{width:23px;height:23px;fill:#fff;display:block}\n"
    "  #derat-teaser .dt-copy{flex:1;min-width:0}\n"
)
if css_block not in embed:
    if css_anchor not in embed:
        raise SystemExit("Missing embed teaser CSS anchor")
    embed = embed.replace(css_anchor, css_anchor + css_block, 1)

old_markup = '''  <div class="dt-tt">Zistite cenu zásahu na počkanie</div>
  <div class="dt-tx">Otvorte <b>kalkulačku</b> — orientačnú cenu deratizácie či dezinsekcie máte do minúty. Poradí aj náš <b>AI asistent</b>.</div>'''
new_markup = '''  <div class="dt-row">
    <span class="dt-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 4v3h10V6H7Zm0 5v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Zm-8 4v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z"/></svg></span>
    <div class="dt-copy">
      <div class="dt-tt">Zistite cenu zásahu na počkanie</div>
      <div class="dt-tx">Otvorte <b>kalkulačku</b> — orientačnú cenu deratizácie či dezinsekcie máte do minúty. Poradí aj náš <b>AI asistent</b>.</div>
    </div>
  </div>'''
if old_markup in embed:
    embed = embed.replace(old_markup, new_markup, 1)
elif new_markup not in embed:
    raise SystemExit("Missing embed teaser markup")
embed_path.write_text(embed, encoding="utf-8")
