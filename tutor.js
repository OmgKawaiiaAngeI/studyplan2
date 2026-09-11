(() => {
  const chat = document.getElementById('tutorChat');
  const input = document.getElementById('tutorInput');
  const send = document.getElementById('tutorSend');
  const status = document.getElementById('tutorStatus');
  const topic = document.getElementById('tutorTopic');
  const clear = document.getElementById('tutorClear');
  const modeButtons = [...document.querySelectorAll('.tutor-mode')];
  const agentButtons = [...document.querySelectorAll('.agent-chip')];
  const uploadBox = document.getElementById('tutorUpload');
  const imageInput = document.getElementById('tutorImage');
  const photoBtn = document.getElementById('tutorPhotoBtn');
  const previewWrap = document.getElementById('tutorPreviewWrap');
  const preview = document.getElementById('tutorPreview');
  const imageName = document.getElementById('tutorImageName');
  const removeImageBtn = document.getElementById('tutorRemoveImage');

  if(!chat || !input || !send) return;

  let mode = 'teach';
  let agent = 'manager';
  let messages = [];
  let imageData = null;

  function typesetMath(el){
    if(window.MathJax && typeof window.MathJax.typesetPromise === 'function') window.MathJax.typesetPromise([el]).catch(() => {});
  }

  function addBubble(role, text, imageUrl){
    const row = document.createElement('div');
    row.className = 'tutor-msg ' + role;
    const bubble = document.createElement('div');
    bubble.className = 'tutor-bubble';
    if(imageUrl){
      const img = document.createElement('img');
      img.className = 'tutor-chat-image';
      img.src = imageUrl;
      img.alt = 'Uploaded maths work';
      bubble.appendChild(img);
    }
    const textEl = document.createElement('div');
    textEl.className = 'tutor-text';
    textEl.textContent = typeof text === 'string' ? text : '';
    bubble.appendChild(textEl);
    row.appendChild(bubble);
    chat.appendChild(row);
    typesetMath(textEl);
    chat.scrollTop = chat.scrollHeight;
    return row;
  }

  function setBusy(busy){
    send.disabled = busy;
    input.disabled = busy;
    topic.disabled = busy;
    agentButtons.forEach(b => b.disabled = busy);
    if(photoBtn) photoBtn.disabled = busy;
    status.textContent = busy ? (imageData ? 'AI Team is reading your photo…' : '@' + agent + ' is working…') : '';
  }

  function clearSelectedImage(){
    imageData = null;
    if(imageInput) imageInput.value = '';
    if(previewWrap) previewWrap.hidden = true;
    if(preview) preview.removeAttribute('src');
    if(imageName) imageName.textContent = 'Photo selected';
  }

  function updateModeUI(){
    if(uploadBox) uploadBox.hidden = mode !== 'check';
    input.placeholder = agent === 'manager' ? 'Ask @Manager anything about your studying...' : `Ask @${agent}...`;
    if(mode !== 'check') clearSelectedImage();
  }

  modeButtons.forEach(btn => btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    updateModeUI();
  }));

  agentButtons.forEach(btn => btn.addEventListener('click', () => {
    agentButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    agent = btn.dataset.agent || 'manager';
    updateModeUI();
  }));

  async function compressImage(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read that image.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('That image format could not be opened. Try a screenshot or JPG/PNG.'));
        img.onload = () => {
          const maxSide = 1600;
          let width = img.width, height = img.height;
          const scale = Math.min(1, maxSide / Math.max(width, height));
          width = Math.round(width * scale); height = Math.round(height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if(photoBtn && imageInput){
    photoBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', async () => {
      const file = imageInput.files && imageInput.files[0];
      if(!file) return;
      if(!file.type.startsWith('image/')){ status.textContent = 'Please choose an image file.'; clearSelectedImage(); return; }
      if(file.size > 15 * 1024 * 1024){ status.textContent = 'That photo is too large. Choose one under 15 MB.'; clearSelectedImage(); return; }
      try{
        status.textContent = 'Preparing photo…';
        imageData = await compressImage(file);
        preview.src = imageData;
        previewWrap.hidden = false;
        imageName.textContent = file.name || 'Maths work photo';
        status.textContent = 'Photo ready to check.';
      }catch(err){ clearSelectedImage(); status.textContent = err.message; }
    });
  }

  if(removeImageBtn) removeImageBtn.addEventListener('click', clearSelectedImage);

  function readJSON(key, fallback){
    try { const x = JSON.parse(localStorage.getItem(key) || 'null'); return x ?? fallback; }
    catch(e){ return fallback; }
  }

  function getStudyContext(){
    return {
      pagesDoneUpTo: typeof pagesDoneUpTo !== 'undefined' ? pagesDoneUpTo : null,
      pagesPerDay: typeof pagesPerDay !== 'undefined' ? pagesPerDay : null,
      checkins: readJSON('checkins', readJSON('csecCheckins', [])).slice(-12),
      questionStats: readJSON('questionStats', readJSON('csecQuestionStats', {})),
      weakTopics: readJSON('weakTopics', []),
      memoryNotes: readJSON('aiTeamMemory', []).slice(-60)
    };
  }

  function saveTeamUpdate(update){
    if(!update || !Array.isArray(update.memoryNotes)) return;
    try{
      const existing = readJSON('aiTeamMemory', []);
      const merged = [...existing, ...update.memoryNotes]
        .filter(x => typeof x === 'string' && x.trim())
        .filter((x, i, arr) => arr.indexOf(x) === i)
        .slice(-60);
      localStorage.setItem('aiTeamMemory', JSON.stringify(merged));
    }catch(e){}
  }

  async function askTutor(){
    let text = input.value.trim();
    if(!text && !imageData) return;
    if(send.disabled) return;
    if(!text && imageData) text = 'Please check my maths work in this photo and explain the first mistake if there is one.';

    const mention = text.match(/^@([a-zA-Z]+)/);
    if(mention){
      const wanted = mention[1].toLowerCase();
      const found = agentButtons.find(b => b.dataset.agent === wanted);
      if(found){ agentButtons.forEach(b => b.classList.remove('active')); found.classList.add('active'); agent = wanted; }
    }

    const sentImage = imageData;
    addBubble('user', text, sentImage);
    messages.push({role:'user', content:text});
    messages = messages.slice(-16);
    input.value = '';
    setBusy(true);

    try{
      const res = await fetch('/api/tutor', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ messages, mode, agent, topic:topic.value, image:sentImage, studyContext:getStudyContext() })
      });
      const data = await res.json().catch(() => ({}));
      if(!res.ok) throw new Error(data.error || 'The AI Team could not respond.');
      const answer = data.answer || 'I could not generate an answer for that one.';
      addBubble('ai', answer);
      messages.push({role:'assistant', content:answer});
      messages = messages.slice(-16);
      try{ localStorage.setItem('csecTutorMessages', JSON.stringify(messages)); }catch(e){}
      saveTeamUpdate(data.studentUpdate);
      clearSelectedImage();
    }catch(err){
      addBubble('ai', 'I hit a connection problem: ' + err.message);
      status.textContent = 'The AI Team request failed. Try again.';
    }finally{
      setBusy(false);
      input.focus();
    }
  }

  send.addEventListener('click', askTutor);
  input.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); askTutor(); } });

  clear.addEventListener('click', () => {
    messages = [];
    clearSelectedImage();
    try{ localStorage.removeItem('csecTutorMessages'); }catch(e){}
    chat.innerHTML = '';
    addBubble('ai', '@Manager is ready. What should the team help you study?');
  });

  try{
    const saved = JSON.parse(localStorage.getItem('csecTutorMessages') || '[]');
    if(Array.isArray(saved) && saved.length){
      messages = saved.slice(-16);
      chat.innerHTML = '';
      messages.forEach(m => addBubble(m.role === 'assistant' ? 'ai' : 'user', m.content));
    }
  }catch(e){}

  updateModeUI();
})();