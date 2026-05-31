# DERAT.sk – AI asistent & cenová kalkulačka

Samostatný widget (jeden súbor `index.html`) pre web **derat.sk**. Plávajúca bublina
vpravo dole otvorí asistenta, ktorý poradí so škodcami a obsahuje prepracovanú
**cenovú kalkulačku s reálnymi fotkami**.

Dizajn a UX sú inšpirované konfigurátorom **„Môj plot"**, prefarbené do brandu
**derat.sk**: zelená `#406618`, červená `#c63a27`, font **Poppins**.

## Čo widget vie
- 💬 **Chatbot** – odpovedá na časté otázky (hlodavce, hmyz, osy, plesne/vírusy, burina,
  stromy, postup zásahu, bezpečnosť, cena, región) s „typing" indikátorom.
- 🧮 **Kalkulačka v 7 jednoduchých krokoch** s peknými, stručnými otázkami:
  1. *Akú službu potrebujete?* – deratizácia / dezinsekcia / dezinfekcia / burina / stromy (karty s **fotkami**)
  2. *Čoho presne sa potrebujete zbaviť?* – konkrétny škodca + info box s vysvetlením
  3. *Kde máme zasiahnuť?* – byt / dom / prevádzka / HoReCa / sklad / exteriér (karty s **fotkami**)
  4. *Aká je veľkosť priestoru?* – posuvník (m² alebo počet stromov) + rýchle voľby
  5. *Ako veľký je problém?* – mierne / stredné / silné (odhad počtu zásahov)
  6. *Chcete niečo navyše?* – doplnky (opakovaný zásah, protokol, monitoring, expres, hniezda)
  7. *Vaša orientačná cena* – animovaná cena, rozpis, formulár dopytu
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

## Nastavenia (na začiatku `<script>`)
```js
const CONFIG={
  phone:'+421905648129', phoneText:'+421 905 648 129',
  email:'info@derat.sk', whatsapp:'421905648129',
  leadEndpoint:'',                                   // voliteľný backend (POST JSON)
  emailjs:{publicKey:'', serviceId:'', templateId:''} // voliteľný EmailJS
};
```
- **Ceny** sú orientačné (€ bez DPH) v objektoch `SERVICES`, `PLACES`, `SEVERITY`,
  `ADDONS` (`base`=výjazd, `rate`=€/m² resp. €/ks, `m`=násobiteľ). Min. výjazd `MIN`.
- **Fotky** sú v objekte `IMG` – stačí vymeniť URL (ideálne za vlastné fotky derat.sk).
- **Texty** chatbota v `reply()`, vysvetlenia v poli `info` služieb a v `PROCESS`,
  otázky v `QUESTIONS`.

> Ceny v kalkulačke sú **orientačné**; konečná suma sa potvrdzuje po obhliadke.

## Kredit k fotkám
Fotografie priestorov, buriny, stromu a fogovania pochádzajú z **Wikimedia Commons**
(voľná licencia, bez nutnosti platby). Fotky myši/švábov sú z derat.sk. Pred ostrým
nasadením odporúčame nahradiť ich vlastnými fotkami z realizácií.
