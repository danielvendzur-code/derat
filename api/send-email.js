// ============================================================================
//  DERAT — /api/send-email  (odoslanie dopytu z kalkulačky na firemný e-mail)
//  Profesionálny HTML e-mail s číslom dopytu #DER-XXXXXX, tabuľkou položiek,
//  rekapituláciou (s DPH) a všetkými parametrami. Históriu NEposiela.
//  ENV: GMAIL_USER, GMAIL_APP_PASSWORD (App Password), MAIL_TO
// ============================================================================

const nodemailer = require('nodemailer');

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const eur = n => (Math.round(Number(n) * 100) / 100).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const LABELS = {
  sluzba: 'Služba', skodca: 'Škodca / problém', priestor: 'Typ priestoru', rozloha: 'Rozloha',
  objem: 'Objem', zamorenie: 'Miera zamorenia', pocet: 'Počet priestorov', doplnky: 'Doplnky',
  zlava: 'Zľava', cestovne: 'Cestovné', termin: 'Želaný termín', kontakt: 'Preferovaný kontakt',
};

function paramsRows(params) {
  return Object.keys(params || {}).filter(k => params[k] != null && params[k] !== '').map(k =>
    `<tr><td style="padding:5px 10px;color:#6b6b6c;border-bottom:1px solid #eef1ef;">${esc(LABELS[k] || k)}</td>
     <td style="padding:5px 10px;font-weight:600;color:#39393a;border-bottom:1px solid #eef1ef;">${esc(params[k])}</td></tr>`
  ).join('');
}

function buildHtml(q, c) {
  const items = Array.isArray(q.items) ? q.items : [];
  const itemRows = items.map(it =>
    `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eef1ef;">${esc(it.n)}</td>
      <td style="padding:8px 10px;text-align:center;border-bottom:1px solid #eef1ef;">${esc(it.q)} ${esc(it.u || '')}</td>
      <td style="padding:8px 10px;text-align:right;border-bottom:1px solid #eef1ef;">${eur(it.up)}</td>
      <td style="padding:8px 10px;text-align:right;font-weight:700;border-bottom:1px solid #eef1ef;">${eur(it.sub)}</td>
    </tr>`).join('');

  const recap = [];
  if (q.matTotal != null) recap.push(['Medzisúčet', eur(q.matTotal)]);
  if (q.discAmount) recap.push([`Zľava${q.discPct ? ' (−' + q.discPct + ' %)' : ''}`, '−' + eur(q.discAmount), '#1c8a66']);
  if (Array.isArray(q.addonsList)) q.addonsList.forEach(a => recap.push(['Doplnok: ' + a.n, '+' + eur(a.p)]));
  if (q.travel && q.travel.fee) recap.push([`Cestovné (≈${q.travel.km} km)`, '+' + eur(q.travel.fee)]);
  const recapRows = recap.map(r =>
    `<tr><td style="padding:5px 10px;color:#6b6b6c;">${esc(r[0])}</td>
     <td style="padding:5px 10px;text-align:right;font-weight:600;color:${r[2] || '#39393a'};">${esc(r[1])}</td></tr>`).join('');

  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#f4faf8;padding:20px;">
    <div style="background:linear-gradient(120deg,#297373,#1e5a5a);color:#fff;padding:18px 22px;border-radius:14px 14px 0 0;">
      <div style="font-size:12px;letter-spacing:1px;opacity:.85;">DOPYT #${esc(q.num || '')}</div>
      <div style="font-size:20px;font-weight:800;margin-top:2px;">${esc(q.productName || 'Dopyt na zásah')}</div>
    </div>
    <div style="background:#fff;padding:20px 22px;border:1px solid #e6e6e6;border-top:0;border-radius:0 0 14px 14px;">
      <h3 style="margin:0 0 8px;color:#297373;font-size:14px;">Zákazník</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:4px 0;width:120px;color:#6b6b6c;">Meno</td><td style="font-weight:700;">${esc(c.name)}</td></tr>
        <tr><td style="padding:4px 0;color:#6b6b6c;">Telefón</td><td><a href="tel:${esc(c.phone)}" style="color:#297373;font-weight:700;text-decoration:none;">${esc(c.phone)}</a></td></tr>
        ${c.email ? `<tr><td style="padding:4px 0;color:#6b6b6c;">E-mail</td><td><a href="mailto:${esc(c.email)}" style="color:#297373;">${esc(c.email)}</a></td></tr>` : ''}
        ${q.lokacia ? `<tr><td style="padding:4px 0;color:#6b6b6c;">Lokalita</td><td>${esc(q.lokacia)}</td></tr>` : ''}
        ${c.message ? `<tr><td style="padding:4px 0;color:#6b6b6c;vertical-align:top;">Poznámka</td><td>${esc(c.message)}</td></tr>` : ''}
      </table>

      ${items.length ? `<h3 style="margin:18px 0 6px;color:#297373;font-size:14px;">Rozsah zásahu</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
        <thead><tr style="background:#e9fbf2;color:#297373;">
          <th style="padding:8px 10px;text-align:left;">Položka</th><th style="padding:8px 10px;">Množstvo</th>
          <th style="padding:8px 10px;text-align:right;">Jedn. cena</th><th style="padding:8px 10px;text-align:right;">Spolu</th>
        </tr></thead><tbody>${itemRows}</tbody>
      </table>
      <div style="font-size:10px;color:#9a9a9b;margin:4px 2px 0;">Ceny sú s DPH.</div>` : ''}

      ${recapRows ? `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;">${recapRows}</table>` : ''}

      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <tr><td style="padding:12px 10px;background:#ff7e47;color:#fff;font-weight:800;font-size:15px;border-radius:10px 0 0 10px;">Celkom (s DPH)</td>
        <td style="padding:12px 10px;background:#ff7e47;color:#fff;font-weight:900;font-size:18px;text-align:right;border-radius:0 10px 10px 0;">${eur(q.total)}</td></tr>
      </table>

      ${paramsRows(q.params) ? `<h3 style="margin:18px 0 6px;color:#297373;font-size:14px;">Parametre</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;">${paramsRows(q.params)}</table>` : ''}

      <div style="margin-top:16px;font-size:11px;color:#9a9a9b;">Orientačný odhad z kalkulačky DERAT — presnú cenu potvrďte po obhliadke / telefonicky.</div>
    </div>
  </div>`;
}

function plainHtml(c) {
  return `<div style="font-family:Arial,sans-serif;font-size:14px;">
    <h2 style="color:#297373;">Nový dopyt z webu DERAT</h2>
    <p><b>Meno:</b> ${esc(c.name)}<br><b>Telefón:</b> ${esc(c.phone)}<br><b>E-mail:</b> ${esc(c.email || '-')}</p>
    <p><b>Správa:</b><br>${esc(c.message || '-').replace(/\n/g, '<br>')}</p>
  </div>`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GMAIL_USER = process.env.GMAIL_USER, GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
  const MAIL_TO = process.env.MAIL_TO || 'dopyt.chatbot@gmail.com';
  if (!GMAIL_USER || !GMAIL_PASS) return res.status(503).json({ error: 'E-mail not configured' });

  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const c = {
      name: (b.from_name || b.customer_name || '').toString().slice(0, 120),
      email: (b.from_email || b.customer_email || '').toString().slice(0, 160),
      phone: (b.phone || b.customer_phone || '').toString().slice(0, 60),
      message: (b.message || b.customer_message || '').toString().slice(0, 3000),
    };
    if (!c.name || !c.phone) return res.status(400).json({ error: 'Missing name/phone' });

    const q = b.quote_data && typeof b.quote_data === 'object' ? b.quote_data : null;
    const subject = q ? `Dopyt #${q.num || ''} – ${q.productName || 'zásah'}` : (b.subject || 'Nový dopyt z webu DERAT');
    const html = q && Array.isArray(q.items) ? buildHtml(q, c) : plainHtml(c);

    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 587, secure: false,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });
    await transport.sendMail({
      from: `"DERAT dopyt" <${GMAIL_USER}>`,
      to: MAIL_TO,
      replyTo: c.email || undefined,
      subject,
      html,
    });

    return res.status(200).json({ ok: true, num: q ? q.num : null });
  } catch (e) {
    console.error('send-email', e);
    return res.status(500).json({ error: 'Send failed' });
  }
};
