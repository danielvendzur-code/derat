<?php
// ============================================================================
//  DERAT — AI chat backend (PHP verzia pre bežný webhosting)
//  Volá Anthropic (Claude) API a vracia { "reply": "..." }.
//
//  NASTAVENIE:
//   1) Nahrajte tento súbor na hosting (napr. https://vasadomena.sk/api/chat.php).
//   2) Nastavte API kľúč — buď cez premennú prostredia ANTHROPIC_API_KEY,
//      alebo doplňte priamo nižšie do $API_KEY (menej bezpečné).
//   3) Vo widgete (index.html) nastavte:  CONFIG.chatApi = 'https://vasadomena.sk/api/chat.php'
// ============================================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');           // uprav na svoju doménu
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

$API_KEY = getenv('ANTHROPIC_API_KEY') ?: '';        // alebo: 'sk-ant-...'
$MODEL   = 'claude-haiku-4-5-20251001';              // rýchly/lacný; kvalitnejší: 'claude-sonnet-4-6'

$SYSTEM = <<<TXT
Si priateľský online asistent slovenskej firmy DERAT, ktorá poskytuje profesionálnu DERATIZÁCIU, DEZINSEKCIU a DEZINFEKCIU.

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
- Odpovedaj po slovensky, priateľsky a stručne (max 2–4 vety). Bez markdownu.
- Pomôž zákazníkovi určiť škodcu a odporuč správnu službu.
- Vždy keď to dáva zmysel, naveď ho na „Cenovú kalkulačku" alebo na priamy kontakt (telefón/WhatsApp).
- Nikdy si nevymýšľaj fakty ani presné ceny – pri cene vždy zdôrazni, že ide o orientačný odhad a presná cena je po obhliadke.
- Ak sa pýtajú mimo témy, slušne a krátko vráť konverzáciu k téme.
TXT;

$raw  = file_get_contents('php://input');
$body = json_decode($raw, true) ?: [];
$message = isset($body['message']) ? mb_substr((string)$body['message'], 0, 1000) : '';
$history = isset($body['history']) && is_array($body['history']) ? array_slice($body['history'], -12) : [];
if ($message === '') { http_response_code(400); echo json_encode(['error' => 'Missing message']); exit; }

$messages = [];
foreach ($history as $m) {
  if (!isset($m['role'], $m['content'])) continue;
  if ($m['role'] !== 'user' && $m['role'] !== 'assistant') continue;
  $messages[] = ['role' => $m['role'], 'content' => mb_substr((string)$m['content'], 0, 1500)];
}
$last = end($messages);
if (!$messages || !$last || $last['content'] !== $message) {
  $messages[] = ['role' => 'user', 'content' => $message];
}

$payload = ['model' => $MODEL, 'max_tokens' => 400, 'system' => $SYSTEM, 'messages' => $messages];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'x-api-key: ' . $API_KEY,
    'anthropic-version: 2023-06-01',
    'content-type: application/json',
  ],
  CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
  CURLOPT_TIMEOUT => 30,
]);
$res  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code !== 200 || !$res) {
  http_response_code(502);
  echo json_encode(['error' => 'AI backend error']);
  exit;
}
$data = json_decode($res, true);
$reply = '';
if (!empty($data['content'])) {
  foreach ($data['content'] as $b) {
    if (($b['type'] ?? '') === 'text') $reply .= $b['text'];
  }
}
$reply = trim($reply);
echo json_encode(['reply' => $reply !== '' ? $reply : 'Prepáčte, skúste to prosím ešte raz alebo nás kontaktujte na +421 905 648 129.'], JSON_UNESCAPED_UNICODE);
