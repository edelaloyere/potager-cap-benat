export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { image, mediaType } = req.body || {};
  if (!image) return res.status(400).json({ error: 'Image manquante' });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image } },
          { type: 'text', text: 'Analyse cette photo de plante de potager. En 3 points maximum : 1) identifie la plante si possible, 2) évalue son état de santé, 3) si tu détectes un problème (maladie, ravageur, carence, manque d\'eau), donne une recommandation concrète et actionnable. Réponse en français, ton direct et pratique, 2-3 phrases max.' }
        ]
      }]
    })
  });

  if (!r.ok) {
    const err = await r.text();
    console.error('Anthropic error:', err);
    return res.status(500).json({ error: 'Erreur API Anthropic' });
  }

  const data = await r.json();
  res.json({ analysis: data.content[0].text });
}
