(() => {
  const chat = document.getElementById('tutorChat');
  const input = document.getElementById('tutorInput');
  const send = document.getElementById('tutorSend');
  const status = document.getElementById('tutorStatus');
  const topic = document.getElementById('tutorTopic');
  const clear = document.getElementById('tutorClear');
  const modeButtons = [...document.querySelectorAll('.tutor-mode')];

  if(!chat || !input || !send) return;

  let mode = 'teach';
  let messages = [];

  function addBubble(role, text){
    const row = document.createElement('div');
    row.className = 'tutor-msg ' + role;
    const bubble = document.createElement('div');
    bubble.className = 'tutor-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
    return row;
  }

  function setBusy(busy){
    send.disabled = busy;
    input.disabled = busy;
    topic.disabled = busy;
    status.textContent = busy ? 'Tutor is working it out…' : '';
  }

  modeButtons.forEach(btn => btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
  }));

  async function askTutor(){
    const text = input.value.trim();
    if(!text || send.disabled) return;

    addBubble('user', text);
    messages.push({role:'user', content:text});
    messages = messages.slice(-12);
    input.value = '';
    setBusy(true);

    try{
      const res = await fetch('/api/tutor', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          messages,
          mode,
          topic:topic.value,
          plannerContext:{
            pagesDoneUpTo: typeof pagesDoneUpTo !== 'undefined' ? pagesDoneUpTo : null,
            pagesPerDay: typeof pagesPerDay !== 'undefined' ? pagesPerDay : null
          }
        })
      });

      const data = await res.json().catch(() => ({}));
      if(!res.ok) throw new Error(data.error || 'The tutor could not respond.');

      const answer = data.answer || 'I could not generate an answer for that one.';
      addBubble('ai', answer);
      messages.push({role:'assistant', content:answer});
      messages = messages.slice(-12);
      try{ localStorage.setItem('csecTutorMessages', JSON.stringify(messages)); }catch(e){}
    }catch(err){
      addBubble('ai', 'I hit a connection problem: ' + err.message);
      status.textContent = 'Check that OPENAI_API_KEY is set in Vercel.';
    }finally{
      setBusy(false);
      input.focus();
    }
  }

  send.addEventListener('click', askTutor);
  input.addEventListener('keydown', e => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      askTutor();
    }
  });

  clear.addEventListener('click', () => {
    messages = [];
    try{ localStorage.removeItem('csecTutorMessages'); }catch(e){}
    chat.innerHTML = '';
    addBubble('ai', 'Fresh start ✨ What CSEC Maths topic do you want to work on?');
  });

  try{
    const saved = JSON.parse(localStorage.getItem('csecTutorMessages') || '[]');
    if(Array.isArray(saved) && saved.length){
      messages = saved.slice(-12);
      chat.innerHTML = '';
      messages.forEach(m => addBubble(m.role === 'assistant' ? 'ai' : 'user', m.content));
    }
  }catch(e){}
})();
