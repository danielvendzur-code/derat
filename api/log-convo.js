// ============================================================================
//  DERAT — /api/log-convo  (logovanie histórie chatu do Upstash Redis)
//  Ukladá JEDEN záznam na session (upsert), NEposiela e-mail. Číta ho admin.html.
//  ENV: KV_REST_API_URL / KV_REST_API_TOKEN  (alebo UPSTASH_REDIS_REST_URL / _TOKEN)
// ============================================================================

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(commands) {
  const r = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`Redis error ${r.status}`);
  return r.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!REDIS_URL || !REDIS_TOKEN) return res.status(503).json({ error: 'Storage not configured' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const sessionId = String(body.sessionId || '');
    if (!/^[a-zA-Z0-9_-]{6,64}$/.test(sessionId)) return res.status(400).json({ error: 'Bad sessionId' });

    let messages = Array.isArray(body.messages) ? body.messages : [];
    messages = messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(0, 200)
      .map(m => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
    if (!messages.length) return res.status(400).json({ error: 'No messages' });

    const now = Date.now();
    let createdAt = now;
    try {
      const ex = await redis([['GET', `convo:${sessionId}`]]);
      const prev = ex && ex[0] && ex[0].result ? JSON.parse(ex[0].result) : null;
      if (prev && prev.createdAt) createdAt = prev.createdAt;   // zachovaj pôvodný čas vzniku
    } catch (e) {}

    const record = {
      id: sessionId,
      createdAt,
      updatedAt: now,
      lang: String(body.lang || 'sk').slice(0, 8),
      page: String(body.page || '').slice(0, 300),
      messages,
    };

    await redis([
      ['SET', `convo:${sessionId}`, JSON.stringify(record)],
      ['ZADD', 'convo:index', String(createdAt), sessionId],
    ]);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('log-convo', e);
    return res.status(500).json({ error: 'Server error' });
  }
};
