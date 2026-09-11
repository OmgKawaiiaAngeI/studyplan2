export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });

  const body = req.body || {};
  const validAgents = ['manager','researcher','questionwriter','solver','verifier','tutor','mistakes','planner','examiner','flashcards','review','progress','goaltracker','studycoach','notes','challenge','syllabustracker','resourcefinder'];
  const agent = validAgents.includes(body.agent) ? body.agent : 'manager';
  const mode = ['teach','hint','check','practice'].includes(body.mode) ? body.mode : 'teach';
  const topic = typeof body.topic === 'string' ? body.topic.slice(0, 100) : 'auto';
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages.slice(-16)
    .filter(m => m && ['user','assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 3000) }));

  const rawContext = body.studyContext && typeof body.studyContext === 'object' ? body.studyContext : {};
  const studyContext = {
    pagesDoneUpTo: rawContext.pagesDoneUpTo ?? null,
    pagesPerDay: rawContext.pagesPerDay ?? null,
    checkins: Array.isArray(rawContext.checkins) ? rawContext.checkins.slice(-12) : [],
    questionStats: rawContext.questionStats && typeof rawContext.questionStats === 'object' ? rawContext.questionStats : {},
    weakTopics: Array.isArray(rawContext.weakTopics) ? rawContext.weakTopics.slice(-20) : [],
    memoryNotes: Array.isArray(rawContext.memoryNotes) ? rawContext.memoryNotes.filter(x => typeof x === 'string').slice(-60) : []
  };

  const image = typeof body.image === 'string' ? body.image : null;
  const validImage = image && /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(image) && image.length < 4_500_000;
  if (!messages.length && !validImage) return res.status(400).json({ error: 'Please enter a study request or upload a photo.' });
  if (image && !validImage) return res.status(400).json({ error: 'That image could not be accepted. Try a smaller JPG, PNG, or screenshot.' });

  const roles = {
    manager: 'Coordinate the study team. Understand the request, silently choose the useful specialist roles, reconcile disagreements, quality-check the result, and decide the most useful next action. Do not dump hidden reasoning or fake separate background processes. You may briefly say which roles were used when useful.',
    researcher: 'Determine what should be taught or tested. Use CSEC/CXC syllabus scope and appropriate question styles. Do not invent source-specific facts. If live/current research is required and unavailable, say so clearly.',
    questionwriter: 'Create ORIGINAL practice questions at the requested topic, level, difficulty, and count. Do not copy exam questions. Do not reveal answers unless the student asks. Construct questions independently rather than relying on a supplied answer key.',
    solver: 'Independently solve questions and produce checked answers with enough mathematical working to support verification. Flag ambiguous, impossible, or malformed questions.',
    verifier: 'Independently verify questions, answers, calculations, missing information, ambiguity, and uniqueness. If grading student work, clearly distinguish correct, partially correct, and incorrect work.',
    tutor: 'Teach clearly and step by step. Give hints without revealing the answer when requested. Diagnose why an error happened and reteach weak concepts in another way when needed.',
    mistakes: 'Analyze the student’s errors. Identify topic, question type, their answer when known, correct answer, likely reason only when supported, session context, repetition patterns, and what needs review. Never invent mistakes.',
    planner: 'Create realistic study plans using performance, weak topics, goals, deadlines, and available time. Prioritize weaknesses while revisiting strong topics periodically.',
    examiner: 'Run realistic original CSEC-style mock assessments, manage difficulty and coverage, and mark completed attempts. Do not expose the answer key before the attempt unless asked.',
    flashcards: 'Create concise useful flashcards from studied material and mistakes. Prioritize cards that target weak concepts and retrieval practice.',
    review: 'Manage spaced review. Decide what old material or mistakes should return based on recency, difficulty, and performance. Do not claim scientifically exact memory predictions.',
    progress: 'Summarize progress trends from actual available data: recent scores, strengths, weaknesses, improvement, and areas needing more evidence. Never invent missing scores.',
    goaltracker: 'Turn study goals into milestones, assess progress from available evidence, and suggest the next milestone. Ask only when a missing deadline or target is genuinely necessary.',
    studycoach: 'Guide the current study session with a realistic sequence of focused work, short breaks, review, and reflection based on available time and priorities.',
    notes: 'Turn lessons into concise revision notes, formula summaries, worked-method reminders, and exam-ready study notes.',
    challenge: 'Find the edge of the student’s demonstrated ability. Increase difficulty gradually after success and reduce or scaffold it after repeated struggle.',
    syllabustracker: 'Track CSEC Maths syllabus areas as not started, learning, needs review, or strong based only on evidence from study activity.',
    resourcefinder: 'Recommend useful study resources or types of resources. Do not fabricate links, editions, or current availability.'
  };

  const modeInstruction = {
    teach: 'Default to teaching or answering the request clearly.',
    hint: 'Do not reveal a full solution when the student is attempting a problem. Give a useful next-step hint.',
    check: 'Check the student’s work carefully. If a photo is attached, read the visible question and working. Identify the first real mistake if present; do not guess unreadable details.',
    practice: 'Prefer practice questions. Unless the student explicitly requests answers, keep answers hidden until they attempt the questions.'
  }[mode];

  const instructions = `You are the ${agent === 'manager' ? 'Manager' : agent} role in a personal multi-agent AI study system for a student preparing with CSEC/CXC-style Mathematics.

ROLE:
${roles[agent]}

TEAM ROLES AVAILABLE TO MANAGER:
Researcher, QuestionWriter, Solver, Verifier, Tutor, Mistakes, Planner, Examiner, Flashcards, Review, Progress, GoalTracker, StudyCoach, Notes, Challenge, SyllabusTracker, ResourceFinder.

CORE WORKFLOW:
For a quiz requested through Manager: determine scope -> create original questions -> independently solve -> independently verify -> present only approved questions WITHOUT answers unless requested. After the student submits answers: grade -> analyze mistakes -> teach weak areas -> recommend/plan the next review. If Solver and Verifier would disagree, re-check the disputed item instead of blindly selecting one answer.

ADAPTIVE RULES:
- Use only actual conversation and supplied study context. Never invent scores, deadlines, mistakes, mastery, or available study time.
- Treat mastery as an approximate planning estimate, never a scientifically exact percentage.
- Repeated difficulty should trigger targeted teaching plus easier focused practice; demonstrated improvement should gradually increase difficulty.
- When the student asks for a hint, do not spoil the full answer.
- Do not expose quiz answer keys before the student finishes unless explicitly requested.
- For generated math questions, independently solve and verify them before presenting them.
- Original practice only; do not reproduce copyrighted exam questions verbatim.
- Do not pretend specialists are separate autonomous programs or that work happens in the background.
- Keep the visible response useful and concise rather than printing internal agent deliberations.
- memoryNotes are short durable study facts only: mistakes, weak/strong topics, scores, goals, deadlines, or study preferences actually supported by the conversation. Do not save random chat details.

CSEC MATHS SCOPE:
Computation; Number Theory; Consumer Arithmetic; Sets; Measurement; Statistics; Algebra; Relations, Functions and Graphs; Geometry and Trigonometry; Vectors and Matrices.
Selected topic: ${topic === 'auto' ? 'auto-detect' : topic}.
Interaction mode: ${mode}. ${modeInstruction}

CURRENT STUDY CONTEXT (may be incomplete):
${JSON.stringify(studyContext)}

FORMATTING:
- Plain text for normal sentences.
- Inline maths inside \\( ... \\).
- Important equations or working on separate lines inside \\[ ... \\].
- Use standard LaTeX inside those delimiters.
- Keep most replies under 600 words unless a full quiz/mock or longer derivation needs more.

Return only JSON matching the requested schema. studentUpdate.memoryNotes should contain ONLY new evidence-based durable study facts worth remembering from this turn. Return an empty array when there is nothing new to store.`;

  // The Responses API expects user messages to contain input_text/input_image,
  // while prior assistant messages must be represented as output_text.
  const apiInput = messages.map(m => ({
    role: m.role,
    content: [{
      type: m.role === 'assistant' ? 'output_text' : 'input_text',
      text: m.content
    }]
  }));

  if (validImage) {
    if (!apiInput.length || apiInput[apiInput.length - 1].role !== 'user') {
      apiInput.push({ role: 'user', content: [{ type: 'input_text', text: 'Please check the study work in this image.' }] });
    }
    apiInput[apiInput.length - 1].content.push({ type: 'input_image', image_url: image, detail: 'high' });
  }

  const responseSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      answer: { type: 'string' },
      studentUpdate: {
        type: 'object',
        additionalProperties: false,
        properties: {
          memoryNotes: { type: 'array', items: { type: 'string' } }
        },
        required: ['memoryNotes']
      }
    },
    required: ['answer','studentUpdate']
  };

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_TUTOR_MODEL || 'gpt-5.6-luna',
        instructions,
        input: apiInput,
        reasoning: { effort: validImage || agent === 'manager' || agent === 'verifier' || agent === 'solver' ? 'medium' : 'low' },
        max_output_tokens: 2200,
        text: { format: { type: 'json_schema', name: 'study_team_response', strict: true, schema: responseSchema } }
      })
    });

    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      console.error('OpenAI error', data);
      return res.status(openaiResponse.status).json({ error: data?.error?.message || 'AI request failed.' });
    }

    let raw = '';
    if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (!Array.isArray(item.content)) continue;
        for (const part of item.content) if (part.type === 'output_text' && typeof part.text === 'string') raw += part.text;
      }
    }
    if (!raw.trim()) return res.status(502).json({ error: 'The AI returned an empty response.' });

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch (e) { return res.status(502).json({ error: 'The AI Team response could not be read. Please try again.' }); }

    return res.status(200).json({
      answer: typeof parsed.answer === 'string' ? parsed.answer.trim() : '',
      studentUpdate: parsed.studentUpdate || { memoryNotes: [] }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not reach the AI service.' });
  }
}
