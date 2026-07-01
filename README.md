# DERAT — chatbot + cenová kalkulačka

Samostatný widget (chat asistent + cenová kalkulačka) pre web firmy na deratizáciu,
dezinsekciu a dezinfekciu. Celý frontend je v jednom súbore **`index.html`** (HTML + CSS + JS,
bez závislostí). AI odpovede chatu zabezpečuje malý backend (`api/chat.js` pre Vercel/Node alebo `php/chat.php` pre PHP hosting).

---

## 1) Rýchle nasadenie na stránku

**Možnosť A – celá stránka / iframe (najjednoduchšie)**
Nahrajte `index.html` na hosting a vložte ho na web cez `<iframe>`, alebo ho použite ako
samostatnú „pomocníkovu" stránku.

**Možnosť B – vloženie widgetu do existujúcej stránky (odporúčané)**
Z `index.html` skopírujte tieto tri časti do svojej šablóny:
1. obsah `<style>…</style>` (do `<head>`),
2. widget markup — bloky `#dr-teaser`, `#derat-bubble` a `<section id="derat-chat">…</section>`
   (tesne pred `</body>`),
3. obsah `<script>…</script>` (tesne pred `</body>`).

Widget je fixne ukotvený vpravo dole a nezasahuje do zvyšku stránky. Na mobile je fullscreen.

---

## 2) Nastavenia (`CONFIG` v `index.html`)

Na začiatku `<script>` je objekt `CONFIG` — upravte podľa firmy:

```js
const CONFIG = {
  phone:'+421905648129', phoneText:'+421 905 648 129',
  email:'farkas.ivan@centrum.sk', whatsapp:'421905648129',
  leadEndpoint:'',            // URL kam sa POST-ne dopyt z formulára (alebo nechajte EmailJS / mailto)
  chatApi:'',                 // URL AI backendu, napr. '/api/chat' (prázdne = lokálne odpovede)
  travelPerKm:0.45, travelFreeKm:30,   // cestovné podľa PSČ (sídlo Bratislava)
  emailjs:{ publicKey:'', serviceId:'', templateId:'' }   // voliteľné odosielanie dopytu cez EmailJS
};
```

Ďalej v JS môžete upraviť: **`SERVICES`** (služby, škodcovia, ceny `base`/`rate`/`m`),
**`PLACES`**, **`SEVERITY`**, **`ADDONS`**, **`IMG`** (fotky) a **`reply()`** (lokálne odpovede chatu).

---

## 3) AI odpovede chatu (backend)

Bez backendu chat funguje na jednoduchých kľúčových slovách (`reply()`).
Pre **plnohodnotné AI odpovede** nasaďte `api/chat.js` a nastavte `CONFIG.apiBase`
(chat volá `apiBase + '/chat'`). Pri chybe/timeoute sa automaticky použije lokálna odpoveď.

### Vercel / Netlify / Node hosting
1. Nasaďte `api/chat.js` ako serverless funkciu (na Verceli automaticky `/api/chat`).
2. V projekte pridajte premennú prostredia `ANTHROPIC_API_KEY = sk-ant-…`.
3. V `index.html`: `CONFIG.apiBase = '/api'` (predvolené).

### Bežný webhosting (PHP)
1. Nahrajte `php/chat.php` na PHP hosting (napr. `https://vasadomena.sk/chat.php`).
2. Nastavte `ANTHROPIC_API_KEY` (env premenná hostingu, alebo priamo v súbore).
3. V `index.html`: `CONFIG.chatApi = 'https://vasadomena.sk/chat.php'`.

> ⚠️ API kľúč **nikdy** nedávajte do frontendu — vždy len na backend.
> Model je predvolene `claude-haiku-4-5` (rýchly a lacný); pre vyššiu kvalitu prepnite na
> `claude-sonnet-4-6` v backende. Systémový prompt (čo bot vie o firme) upravte v backende.

---

## 4) Dopyty z kalkulačky

Po vyplnení kontaktu sa dopyt odošle podľa nastavenia:
- **`leadEndpoint`** – POST JSON na vašu URL (uložíte do DB / pošlete e-mail), alebo
- **EmailJS** (`CONFIG.emailjs`) – odoslanie e-mailu z prehliadača, alebo
- **fallback** – otvorí e-mailového klienta (mailto) / WhatsApp s predvyplneným dopytom.

---

## 5) Čo treba doplniť od firmy

Reálne ceny, oblasti pôsobenia, otváracie hodiny a ďalšie údaje — pozri
**`OTAZKY-PRE-MAJITELA.md`**.

> Ceny v kalkulačke sú **orientačné**; konečná suma sa potvrdzuje po obhliadke.


## 4) História konverzácie (v prehliadači)

Chat si **pamätá konverzáciu** aj po obnovení stránky — ukladá sa do prehliadača
návštevníka (`localStorage`, drží sa 7 dní). Pri opätovnom otvorení sa správy obnovia.
Tlačidlo **↻ (reset)** v hlavičke históriu vymaže a začne odznova.

---

## 6) Serverové logovanie histórie + odosielanie dopytov e-mailom

Voliteľné rozšírenie (podľa vzoru „Môj plot"). Zapne sa nastavením **`CONFIG.apiBase`**
v `index.html` na URL nasadeného backendu, napr.:

```js
apiBase:'https://derat-widget.vercel.app/api'
```

Keď je prázdne, widget funguje bez týchto funkcií (logovanie a odosielanie sa preskočia,
UI to nikdy nezhodí — fire-and-forget). Sú to tri serverless funkcie v priečinku `api/`:

> 📋 **Presný postup spustenia krok za krokom** (Vercel + Upstash + Gmail + environment variables)
> nájdete v **[`NASADENIE.md`](NASADENIE.md)**. Widget sa na web vkladá cez **[`embed.html`](embed.html)**.

### `api/log-convo.js` — logovanie histórie chatu do Upstash Redis
Widget po každej správe zákazníka odošle celú viditeľnú konverzáciu (`role: user/assistant`)
na `POST /api/log-convo`. Jeden záznam na `sessionId` (upsert, zachováva čas vzniku).
**Históriu nikdy neposiela e-mailom** — slúži len pre admin dashboard.

- ENV: `KV_REST_API_URL` + `KV_REST_API_TOKEN` (alebo `UPSTASH_REDIS_REST_URL` / `_TOKEN`).

### `api/history.js` — čítanie histórie pre admina (chránené)
`GET /api/history?from=&to=&limit=&offset=` vráti zoznam konverzácií, `DELETE /api/history?id=`
zmaže konverzáciu (GDPR). Chránené hlavičkou `Authorization: Bearer <ADMIN_KEY>`.

- ENV: rovnaké Redis premenné + `ADMIN_KEY` (ľubovoľné tajné heslo).
- Dashboard: otvorte **`admin.html`**, zadajte API URL (`…/api`) a admin kľúč.

### `api/send-email.js` — odoslanie dopytu z kalkulačky na firemný e-mail
Po vyplnení kontaktu widget odošle `POST /api/send-email` s `quote_data` (číslo dopytu
`DER-XXXXXX`, položky, rekapitulácia a parametre — **ceny s DPH**). Backend pošle
profesionálny HTML e-mail cez Gmail SMTP. História sa **neposiela**.

- ENV: `GMAIL_USER`, `GMAIL_APP_PASSWORD` ([App Password](https://myaccount.google.com/apppasswords)),
  `MAIL_TO` (predvolene `dopyt.chatbot@gmail.com`).
- Závislosť `nodemailer` je v `package.json` (Vercel ju nainštaluje automaticky).

> Zhrnutie ENV premenných na backende: `ANTHROPIC_API_KEY`, `KV_REST_API_URL`,
> `KV_REST_API_TOKEN`, `ADMIN_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_TO`.
