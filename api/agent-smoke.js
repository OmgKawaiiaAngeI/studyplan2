const AGENTS = ['manager','researcher','questionwriter','solver','verifier','tutor','mistakes','planner','examiner','flashcards','review','progress','goaltracker','studycoach','notes','challenge','syllabustracker','resourcefinder'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok:false, error:'GET only' });
  const agent = typeof req.query.agent === 'string' ? req.query.agent.toLowerCase() : '';
  if (!AGENTS.includes(agent)) return res.status(400).json({ ok:false, error:'Unknown agent' });

  const host = req.headers.host;
  try {
    const response = await fetch(`https://${host}/api/tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent,
        mode: agent === 'questionwriter' || agent === 'examiner' || agent === 'challenge' ? 'practice' : 'teach',
        topic: 'Algebra',
        messages: [
          { role: 'user', content: 'Remember that this is a smoke test.' },
          { role: 'assistant', content: 'Understood.' },
          { role: 'user', content: 'Reply with one short sentence showing your study role works. Do not create a long exercise.' }
        ],
        studyContext: { memoryNotes: ['Smoke test context only.'] }
      })
    });
    const data = await response.json().catch(() => ({}));
    return res.status(response.ok ? 200 : 500).json({
      ok: response.ok && typeof data.answer === 'string' && data.answer.length > 0,
      agent,
      upstreamStatus: response.status,
      answer: typeof data.answer === 'string' ? data.answer.slice(0, 300) : null,
      error: data.error || null
    });
  } catch (error) {
    return res.status(500).json({ ok:false, agent, error:error.message });
  }
}
