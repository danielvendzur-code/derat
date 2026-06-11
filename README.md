# DERAT.sk – AI asistent & cenová kalkulačka

Samostatný widget (jeden súbor `index.html`) pre web **derat.sk**. Plávajúca bublina
vpravo dole otvorí asistenta, ktorý poradí so škodcami a obsahuje prepracovanú
**cenovú kalkulačku s reálnymi fotkami**.

Dizajn a UX sú inšpirované konfigurátorom **„Môj plot"**, prefarbené do brandu
**derat.sk**: zelená `#406618`, červená `#c63a27`, font **Poppins**.

## Čo widget vie
- 💬 **Chatbot** – odpovedá na časté otázky (hlodavce, hmyz, osy, plesne/vírusy,
  postup zásahu, bezpečnosť, cena, doprava a región) s „typing" indikátorom.
- 🧮 **Dynamická kalkulačka** s peknými, stručnými otázkami:
  1. *Akú službu potrebujete?* – deratizácia / dezinsekcia / dezinfekcia (karty s **fotkami**)
  2. *Čoho presne sa potrebujete zbaviť?* – konkrétny škodca + info box s vysvetlením
  3. *Kde máme zasiahnuť?* – byt / dom / prevádzka / HoReCa / sklad / exteriér (karty s **fotkami**)
  4. *Aká je veľkosť priestoru?* – rozhodujúca rozloha v m² alebo pri dezinfekcii objem v m³
  5. *Ako veľký je problém?* – mierne / stredné / silné; podľa toho sa automaticky zvolí materiál
  6. *Kde a kedy?* – PSČ, doprava 0,40 €/km, víkend a sviatok
  7. *Chcete doplnkové služby?* – šesť orientačne nacenených možností + vlastná požiadavka
  8. *Vaša orientačná cena* – kompaktný rozpis bez DPH, s DPH a formulár dopytu
- 📷 **Reálne fotky** – fotka služby/priestoru v hero náhľade (jemný Ken Burns zoom),
  fotky na výberových kartách. Zdroje: oficiálne fotky derat.sk + Wikimedia Commons (voľná licencia).
- 💶 **Živá cena** – počas vypĺňania vidíte priebežnú orientačnú sumu; na konci animovaný súčet + rozpis.
- 📝 **Vysvetlenia presne podľa derat.sk** – info boxy a postup zásahu.
- 📩 **Odoslanie dopytu** – funguje hneď (predvyplnený **e-mail** alebo **WhatsApp**),
  voliteľne cez **EmailJS** alebo vlastný backend.
- ✨ Animácie (bublina, prechody krokov, count-up ceny) · rešpektuje `prefers-reduced-motion`.
- 📱 Plne responzívne (na mobile fullscreen).

- 🐭 **Maskot** – usmievavá myš ako ikona asistenta (bublina, hlavička, avatary).
- 💰 **Logické ceny** – počíta sa *cena za 1 zásah × počet zásahov* (rozsah), takže väčší problém = výrazne vyššia cena.

## Vloženie do stránky
Skopírujte blok medzi `<!-- WIDGET -->` (vrátane `<style>`, `<section>` a `<script>`)
do šablóny webu. Blok `<div class="demo">…</div>` je len ukážkové pozadie – na ostrej
stránke ho vynechajte. Súbor `@emailjs/browser` v `<head>` načítajte len ak chcete EmailJS.

Priame vloženie kódu je vhodnejšie než celostránkový `iframe`: mimo otvoreného okna zostáva
web normálne klikateľný. Ak sa použije `iframe`, jeho desktopový rám má byť najviac približne
`470 × 760 px` a umiestnený vpravo dole; priehľadný celostránkový iframe by blokoval kliknutia
na stránke pod ním.

## Nastavenia (na začiatku `<script>`)
```js
const CONFIG={
  phone:'+421905648129', phoneText:'+421 905 648 129',
  email:'info@derat.sk', whatsapp:'421905648129',
  leadEndpoint:'',                                   // voliteľný backend (POST JSON)
  emailjs:{publicKey:'', serviceId:'', templateId:''} // voliteľný EmailJS
};
```
- **Ceny** sú orientačné a všetky vstupy z cenníka sú bez DPH. Minimum výjazdu a práce je
  `60 €`, doprava mimo Bratislavy `0,40 €/km`, víkend `+20 %` a sviatok `+50 %`.
- Ploštice sa počítajú podľa rozlohy; rodinný dom má zachované cenníkové minimum `200 €`.
- Pri hlodavcoch kalkulačka sama vyberie vhodný materiál podľa škodcu a miery zamorenia.
- PSČ určuje orientačnú vzdialenosť z Bratislavy tam aj späť. Presná doprava sa potvrdí
  podľa úplnej adresy.
- Dopyt obsahuje cenu bez DPH, rozsah odhadu, cenu s DPH, dopravu, príplatok aj materiál.
- **Fotky** sú v objekte `IMG` – stačí vymeniť URL (ideálne za vlastné fotky derat.sk).
- **Texty** chatbota v `reply()`, vysvetlenia v poli `info` služieb a v `PROCESS`,
  otázky v `QUESTIONS`.

> Ceny v kalkulačke sú **orientačné**; konečná suma sa potvrdzuje po obhliadke.

## Kredit k fotkám
Fotografie priestorov, buriny, stromu a fogovania pochádzajú z **Wikimedia Commons**
(voľná licencia, bez nutnosti platby). Fotky myši/švábov sú z derat.sk. Pred ostrým
nasadením odporúčame nahradiť ich vlastnými fotkami z realizácií.
