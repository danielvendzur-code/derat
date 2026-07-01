// ============================================================================
//  DERAT — /api/history  (čítanie histórie chatu pre admin dashboard)
//  Chránené ADMIN_KEY. GET = zoznam (filter dátumom), DELETE = GDPR mazanie.
//  ENV: KV_REST_API_URL/_TOKEN (alebo UPSTASH_REDIS_REST_URL/_TOKEN), ADMIN_KEY
// ============================================================================

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_KEY = process.env.ADMIN_KEY;

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!REDIS_URL || !REDIS_TOKEN) return res.status(503).json({ error: 'Storage not configured' });

  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!ADMIN_KEY || auth !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const url = new URL(req.url, 'http://x');
  const q = Object.fromEntries(url.searchParams.entries());

  try {
    if (req.method === 'DELETE') {
      const id = String(q.id || '');
      if (!/^[a-zA-Z0-9_-]{6,64}$/.test(id)) return res.status(400).json({ error: 'Bad id' });
      await redis([['DEL', `convo:${id}`], ['ZREM', 'convo:index', id]]);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET') {
      const dayStart = d => { const t = Date.parse(d + 'T00:00:00'); return isNaN(t) ? null : t; };
      const dayEnd = d => { const t = Date.parse(d + 'T23:59:59.999'); return isNaN(t) ? null : t; };
      const from = q.from ? dayStart(q.from) : '-inf';
      const to = q.to ? dayEnd(q.to) : '+inf';
      const limit = Math.min(200, Math.max(1, parseInt(q.limit, 10) || 50));
      const offset = Math.max(0, parseInt(q.offset, 10) || 0);

      const cnt = await redis([['ZCOUNT', 'convo:index', String(from), String(to)]]);
      const total = (cnt && cnt[0] && cnt[0].result) || 0;

      const idsR = await redis([['ZREVRANGEBYSCORE', 'convo:index', String(to), String(from), 'LIMIT', String(offset), String(limit)]]);
      const ids = (idsR && idsR[0] && idsR[0].result) || [];
      let items = [];
      if (ids.length) {
        const mg = await redis([['MGET', ...ids.map(id => `convo:${id}`)]]);
        const arr = (mg && mg[0] && mg[0].result) || [];
        items = arr.map(s => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
      }
      return res.status(200).json({ total, limit, offset, items });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('history', e);
    return res.status(500).json({ error: 'Server error' });
  }
};
