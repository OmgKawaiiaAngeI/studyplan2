export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });
  }

  const body = req.body || {};
  const mode = ['teach','hint','check','practice'].includes(body.mode) ? body.mode : 'teach';
  const topic = typeof body.topic === 'string' ? body.topic.slice(0, 100) : 'auto';
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .slice(-12)
    .filter(m => m && ['user','assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 3000) }));

  if (!messages.length) return res.status(400).json({ error: 'Please enter a maths question.' });

  const modeInstruction = {
    teach: 'Teach the idea clearly. Work step by step, explain why each step works, then give a short final answer.',
    hint: 'Do NOT give the full solution immediately. Give one useful hint or next step, then ask the student to try it.',
    check: 'Check the student’s working carefully. Identify the first mistake, explain it simply, and show how to correct it. If their work is correct, say so and verify it.',
    practice: 'Act as a practice coach. Give ONE CSEC-style question at an appropriate difficulty. Do not reveal the answer until the student attempts it.'
  }[mode];

  const instructions = `You are a specialist CSEC Mathematics General Proficiency tutor for Caribbean students.

Focus on the CXC CSEC Mathematics syllabus areas: Computation; Number Theory; Consumer Arithmetic; Sets; Measurement; Statistics; Algebra; Relations, Functions and Graphs; Geometry and Trigonometry; Vectors and Matrices.

The selected topic is: ${topic === 'auto' ? 'auto-detect from the student question' : topic}.
Tutor mode: ${mode}. ${modeInstruction}

Teaching rules:
- Use CSEC/CXC-style terminology and methods where appropriate.
- Be patient, clear, concise, and encouraging without being childish.
- Prefer working and reasoning over simply giving an answer.
- When solving, lay out equations vertically when that makes the working easier to follow.
- For multiple-choice questions, explain why the correct option works; briefly address distractors only when useful.
- For exam questions, mention the key working a student should show to earn method marks.
- Use exact values until rounding is needed, and state the requested degree of accuracy.
- For geometry/trigonometry, clearly identify the formula before substituting values.
- If the student asks for a hint, do not spoil the whole answer.
- If information is missing from a question, ask for the missing value rather than inventing it.
- Stay focused on Mathematics and closely related CSEC exam study.
- Never claim to have seen an image or page unless its contents were actually provided in the text.

Use plain text with readable line breaks. Keep most responses under about 450 words unless a longer derivation is genuinely needed.`;

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TUTOR_MODEL || 'gpt-5.6-luna',
        instructions,
        input: messages,
        reasoning: { effort: 'low' },
        max_output_tokens: 1400
      })
    });

    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      console.error('OpenAI error', data);
      return res.status(openaiResponse.status).json({ error: data?.error?.message || 'AI request failed.' });
    }

    let answer = '';
    if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (!Array.isArray(item.content)) continue;
        for (const part of item.content) {
          if (part.type === 'output_text' && typeof part.text === 'string') answer += part.text;
        }
      }
    }

    if (!answer.trim()) return res.status(502).json({ error: 'The AI returned an empty response.' });
    return res.status(200).json({ answer: answer.trim() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not reach the AI service.' });
  }
}
