# DERAT — presný postup spustenia (Vercel + história + e-mail)

Tento návod vás krok za krokom prevedie spustením:
- **AI chatu** (voliteľné),
- **logovania histórie** konverzácií (Upstash Redis) + **admin prehľadu**,
- **odosielania dopytov e-mailom** (Gmail účet `dopyt.chatbot@gmail.com` ako **odosielateľ**).

Model nasadenia je rovnaký ako „Môj plot": celý widget aj API bežia na **Verceli**,
na váš web ich vložíte malým `<iframe>` (súbor `embed.html`).

---

## KROK 1 — Nahrať projekt na Vercel

1. Choďte na <https://vercel.com> → prihláste sa cez GitHub.
2. **Add New… → Project** → vyberte repozitár `derat` → **Import**.
3. Framework Preset nechajte **Other** (je to statické `index.html` + funkcie v `api/`).
   Build Command a Output nechajte prázdne. Kliknite **Deploy**.
4. Po nasadení dostanete adresu, napr. `https://derat-xxxx.vercel.app`.
   - Widget je na `https://derat-xxxx.vercel.app/`
   - API je na `https://derat-xxxx.vercel.app/api/...`
   - Admin je na `https://derat-xxxx.vercel.app/admin.html`

> `nodemailer` z `package.json` sa nainštaluje automaticky.

---

## KROK 2 — Databáza pre históriu (Upstash Redis, zdarma)

1. V projekte na Verceli otvorte záložku **Storage → Create Database → Upstash for Redis**
   (Marketplace). Vyberte región (napr. Frankfurt) → **Create**.
2. Kliknite **Connect** a prepojte s projektom `derat`.
   Tým sa do projektu **automaticky pridajú** premenné `KV_REST_API_URL` a `KV_REST_API_TOKEN`.

> Ak radšej Upstash mimo Vercelu: založte databázu na <https://upstash.com>, skopírujte
> `UPSTASH_REDIS_REST_URL` a `UPSTASH_REDIS_REST_TOKEN` a vložte ich ako env premenné (Krok 4).
> Kód rozumie obom názvom (`KV_REST_API_*` aj `UPSTASH_REDIS_REST_*`).

---

## KROK 3 — Gmail App Password pre odosielateľa

Odosielateľom e-mailov je účet **`dopyt.chatbot@gmail.com`**.

1. Prihláste sa do tohto Gmail účtu.
2. Zapnite **2-stupňové overenie**: <https://myaccount.google.com/security> → „2-Step Verification".
3. Vytvorte **App Password**: <https://myaccount.google.com/apppasswords>
   → názov napr. `derat` → **Create** → skopírujte 16-znakový kód (bez medzier).
   Toto heslo pôjde do premennej `GMAIL_APP_PASSWORD`.

---

## KROK 4 — Pridať Environment Variables na Verceli

Vo Verceli: **Project → Settings → Environment Variables**. Pri každej premennej
zadajte **Key** a **Value**, nechajte zaškrtnuté všetky prostredia (Production/Preview/Development)
a dajte **Save**.

| Key | Value | Na čo slúži |
|-----|-------|-------------|
| `GMAIL_USER` | `dopyt.chatbot@gmail.com` | odosielateľ e-mailov dopytov |
| `GMAIL_APP_PASSWORD` | *(16-znakový App Password z Kroku 3)* | prihlásenie odosielateľa |
| `MAIL_TO` | *(kam majú chodiť dopyty; predvolene `info@derat.sk`)* | príjemca dopytov |
| `ADMIN_KEY` | *(vymyslené silné heslo, napr. `derat-2025-XY7k`)* | prístup do admin prehľadu histórie |
| `KV_REST_API_URL` | *(z Upstash, ak sa nepridalo automaticky)* | história — pripojenie na Redis |
| `KV_REST_API_TOKEN` | *(z Upstash, ak sa nepridalo automaticky)* | história — token Redis |
| `ANTHROPIC_API_KEY` | `sk-ant-…` *(voliteľné)* | AI odpovede chatu (bez neho beží lokálny režim) |

Po pridaní premenných spustite **redeploy**: záložka **Deployments → … pri poslednom → Redeploy**.

---

## KROK 5 — Zapnúť funkcie vo widgete (`CONFIG.apiBase`)

V súbore `index.html` na začiatku `<script>` nájdite `CONFIG` a nastavte `apiBase`:

```js
apiBase:'/api',   // widget beží na Verceli spolu s API → stačí relatívne '/api'
```

Ak by ste widget servírovali z inej domény než API (napr. GitHub Pages),
dajte tam **plnú adresu**: `apiBase:'https://derat-xxxx.vercel.app/api'`.

Zmenu commitnite a pushnite — Vercel sa sám prenasadí.
Keď je `apiBase` prázdne, história aj e-mail sa preskočia (widget beží ďalej, dopyt spadne na mailto).

---

## KROK 6 — Vložiť widget na firemný web

1. Otvorte `embed.html`, v `<iframe src="...">` nahraďte `VAS-PROJEKT.vercel.app`
   vašou Vercel adresou (`derat-xxxx.vercel.app`).
2. Celý obsah `embed.html` skopírujte na váš web **tesne pred `</body>`**.

Widget sa ukotví vpravo dole; po kliknutí sa rozbalí. Na mobile je na celú obrazovku.

---

## KROK 7 — Admin prehľad histórie

1. Otvorte `https://derat-xxxx.vercel.app/admin.html`.
2. Vyplňte:
   - **API URL** = `https://derat-xxxx.vercel.app/api`
   - **Admin kľúč** = hodnota `ADMIN_KEY` z Kroku 4
3. **Načítať** — zobrazia sa konverzácie. Dá sa filtrovať dátumom, rozbaliť konverzáciu
   a **Zmazať** (GDPR). Údaje sa ukladajú v prehliadači admina len lokálne.

> História chatu sa **nikdy** neposiela e-mailom — je len tu, v admin prehľade.

---

## KROK 8 — Otestovať

1. Na webe otvorte widget, napíšte pár správ → v admine sa má objaviť konverzácia.
2. V kalkulačke prejdite na koniec, vyplňte meno + telefón, odošlite dopyt →
   do schránky príjemcu (`MAIL_TO`) príde e-mail **Dopyt #DER-XXXXXX** s položkami a cenou **s DPH**.
3. Ak e-mail nechodí: skontrolujte, či je zapnuté 2-stupňové overenie a či je
   `GMAIL_APP_PASSWORD` bez medzier; pozrite **Vercel → Deployments → Functions → Logs**.

---

## Prehľad premenných (rýchla referencia)

```
GMAIL_USER=dopyt.chatbot@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
MAIL_TO=info@derat.sk                  # príjemca dopytov
ADMIN_KEY=vymyslene-silne-heslo
KV_REST_API_URL=https://....upstash.io
KV_REST_API_TOKEN=....
ANTHROPIC_API_KEY=sk-ant-....          # voliteľné (AI chat)
```
