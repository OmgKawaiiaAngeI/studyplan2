(() => {
  const chat = document.getElementById('tutorChat');
  const input = document.getElementById('tutorInput');
  const send = document.getElementById('tutorSend');
  const status = document.getElementById('tutorStatus');
  const topic = document.getElementById('tutorTopic');
  const clear = document.getElementById('tutorClear');
  const modeButtons = [...document.querySelectorAll('.tutor-mode')];
  const uploadBox = document.getElementById('tutorUpload');
  const imageInput = document.getElementById('tutorImage');
  const photoBtn = document.getElementById('tutorPhotoBtn');
  const previewWrap = document.getElementById('tutorPreviewWrap');
  const preview = document.getElementById('tutorPreview');
  const imageName = document.getElementById('tutorImageName');
  const removeImageBtn = document.getElementById('tutorRemoveImage');

  if(!chat || !input || !send) return;

  let mode = 'teach';
  let messages = [];
  let imageData = null;

  function typesetMath(el){
    if(window.MathJax && typeof window.MathJax.typesetPromise === 'function'){
      window.MathJax.typesetPromise([el]).catch(() => {});
    }
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
    if(photoBtn) photoBtn.disabled = busy;
    status.textContent = busy ? (imageData ? 'Tutor is reading your photo…' : 'Tutor is working it out…') : '';
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
    input.placeholder = mode === 'check'
      ? 'Tell the tutor what to check, or just upload a photo...'
      : 'Ask a CSEC maths question...';
    if(mode !== 'check') clearSelectedImage();
  }

  modeButtons.forEach(btn => btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
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
          let width = img.width;
          let height = img.height;
          const scale = Math.min(1, maxSide / Math.max(width, height));
          width = Math.round(width * scale);
          height = Math.round(height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
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
      if(!file.type.startsWith('image/')){
        status.textContent = 'Please choose an image file.';
        clearSelectedImage();
        return;
      }
      if(file.size > 15 * 1024 * 1024){
        status.textContent = 'That photo is too large. Choose one under 15 MB.';
        clearSelectedImage();
        return;
      }
      try{
        status.textContent = 'Preparing photo…';
        imageData = await compressImage(file);
        preview.src = imageData;
        previewWrap.hidden = false;
        imageName.textContent = file.name || 'Maths work photo';
        status.textContent = 'Photo ready to check.';
      }catch(err){
        clearSelectedImage();
        status.textContent = err.message;
      }
    });
  }

  if(removeImageBtn) removeImageBtn.addEventListener('click', clearSelectedImage);

  async function askTutor(){
    let text = input.value.trim();
    if(!text && !imageData) return;
    if(send.disabled) return;

    if(!text && imageData){
      text = 'Please check my maths work in this photo. Tell me what I did right, identify the first mistake if there is one, and show me how to fix it.';
    }

    const sentImage = imageData;
    addBubble('user', text, sentImage);
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
          image:sentImage,
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
      clearSelectedImage();
    }catch(err){
      addBubble('ai', 'I hit a connection problem: ' + err.message);
      status.textContent = 'The tutor request failed. Try again in a moment.';
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
    clearSelectedImage();
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

  updateModeUI();
})();