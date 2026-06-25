// ============================================================================
//  DERAT — AI chat backend (serverless)
//  Funguje na Vercel / Netlify Functions / Cloudflare (Node runtime) a pod.
//  Volá Anthropic (Claude) API a vracia { reply }.
//
//  NASTAVENIE:
//   1) Nasaďte tento súbor ako serverless funkciu (napr. Vercel: /api/chat).
//   2) V prostredí (env) nastavte premennú:  ANTHROPIC_API_KEY = sk-ant-...
//   3) Vo widgete (index.html) nastavte:  CONFIG.chatApi = '/api/chat'
//      (alebo plnú URL, ak je backend na inej doméne).
// ============================================================================

const MODEL = 'claude-haiku-4-5-20251001'; // rýchly a lacný; pre vyššiu kvalitu: 'claude-sonnet-4-6'

const SYSTEM = `Si priateľský online asistent slovenskej firmy DERAT, ktorá poskytuje profesionálnu DERATIZÁCIU, DEZINSEKCIU a DEZINFEKCIU.

ČO ROBÍME:
- Deratizácia – hlodavce: potkany, myši, hraboše (nástrahy, odchytové klietky a pasce).
- Dezinsekcia – hmyz: šváby/rusy, ploštice, mravce, blchy, muchy, komáre, osy a sršne, kliešte (postrek, zadymovanie, plynovanie, nástrahy).
- Dezinfekcia – plesne, vírusy a baktérie, holuby/kanalizácia (polymérová dezinfekcia, vhodná aj po COVID-19 či havárii kanalizácie).

DÔLEŽITÉ FAKTY:
- Sídlime v Bratislave, ale pôsobíme po celom Slovensku. Cestovné: v Bratislavskom kraji zdarma, ďalej orientačne ~0,40 €/km.
- Ceny sú orientačné a závisia od služby, druhu škodcu, plochy (m²) a miery zamorenia; minimálny výjazd 60 €. Príklady: deratizácia bytu od ~60–90 €, dezinsekcia od ~90 €, ploštice v byte ~160 €. Presnú cenu potvrdíme po obhliadke alebo telefonicky.
- Niektorých škodcov (ploštice, šváby, blchy, hlodavce) NEJDE spoľahlivo odstrániť na jediný raz – z vajíčok a lariev sa liahnu nové jedince, preto je súčasťou aj opakované/kontrolné ošetrenie (cena to už zahŕňa).
- Používame certifikované prípravky, poskytujeme garanciu a na požiadanie písomný protokol o zásahu (vhodné pre gastro/HACCP).
- Kontakt: telefón +421 905 648 129, WhatsApp, e-mail farkas.ivan@centrum.sk.

ŠTÝL ODPOVEDÍ:
- Odpovedaj po slovensky, priateľsky a stručne (max 2–4 vety). Bez markdownu a bez emoji nadmieru.
- Pomôž zákazníkovi určiť škodcu a odporuč správnu službu.
- Vždy keď to dáva zmysel, naveď ho na „Cenovú kalkulačku" (tlačidlo Spočítať cenu) alebo na priamy kontakt (telefón/WhatsApp).
- Nikdy si nevymýšľaj fakty ani konkrétne presné ceny – pri cene vždy zdôrazni, že ide o orientačný odhad a presná cena je po obhliadke.
- Ak sa pýtajú mimo témy škodcov a našich služieb, slušne a krátko vráť konverzáciu k téme.`;

module.exports = async (req, res) => {
  // CORS (uprav podľa svojej domény)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = (body.message || '').toString().slice(0, 1000);
    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
    if (!message) return res.status(400).json({ error: 'Missing message' });

    // poskladaj správy (rola user/assistant), posledná je aktuálna otázka
    const messages = history
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .map(m => ({ role: m.role, content: String(m.content).slice(0, 1500) }));
    if (!messages.length || messages[messages.length - 1].content !== message) {
      messages.push({ role: 'user', content: message });
    }

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system: SYSTEM, messages }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error('Anthropic error', r.status, t);
      return res.status(502).json({ error: 'AI backend error' });
    }
    const data = await r.json();
    const reply = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    return res.status(200).json({ reply: reply || 'Prepáčte, skúste to prosím ešte raz alebo nás kontaktujte na +421 905 648 129.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};
