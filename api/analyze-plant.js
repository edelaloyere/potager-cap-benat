export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages manquants' });
  }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: 'Tu es un expert en jardinage potager. Analyse les photos de plantes avec précision : identifie la plante, évalue sa santé, détecte les maladies ou carences, et donne des conseils concrets. Réponds en français, ton direct et pratique. Sois concis (3-4 phrases max sauf si on te pose une question précise).',
      messages
    })
  });

  if (!r.ok) {
    const err = await r.text();
    console.error('Anthropic error:', err);
    return res.status(500).json({ error: 'Erreur API Anthropic' });
  }

  const data = await r.json();
  res.json({ reply: data.content[0].text });
}
