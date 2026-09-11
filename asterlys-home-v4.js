(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const taskKey='homeTasksV4',examKey='homeExamsV4';
function wait(fn,n=70){if(fn())return;if(n)setTimeout(()=>wait(fn,n-1),100)}
function fmtDate(v){if(!v)return'No date';try{return new Date(v+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}catch{return v}}

wait(()=>{
 const main=document.querySelector('.app-main-area'),dash=$('view-dashboard');
 if(!main||!dash||!window.studyAppShow)return false;
 if(!$('astHomeBtn')){const b=document.createElement('button');b.id='astHomeBtn';b.className='ast-home-btn';b.textContent='⌂ Home';b.onclick=()=>window.studyAppShow('dashboard');main.insertBefore(b,main.firstChild)}
 const hero=dash.querySelector('.dash-hero');
 if(hero){const k=hero.querySelector('.dash-kicker'),h=hero.querySelector('h2'),p=hero.querySelector('#dashMessage');if(k)k.textContent='My study planner';if(h)h.textContent='Hello! What are we studying today?';if(p)p.textContent='Your tasks, exams, study tools, notes and AI Study Team are all in one place.'}
 if(!$('astHomeStrip')){
  const s=document.createElement('div');s.id='astHomeStrip';s.className='ast-home-strip';
  s.innerHTML=`<section class="ast-home-card"><div class="ast-card-head"><h3>Focus Tasks</h3><button class="ast-home-link" id="astTaskToggle">+ Add task</button></div><form id="astTaskForm" class="ast-inline-form" hidden><input id="astTaskTitle" placeholder="What needs to be done?" required><input id="astTaskDate" type="date"><button class="fc-btn" type="submit">Save task</button></form><div id="astTasks"></div></section><section class="ast-home-card"><div class="ast-card-head"><h3>Upcoming Exams</h3><button class="ast-home-link" id="astExamToggle">+ Add exam</button></div><form id="astExamForm" class="ast-inline-form" hidden><input id="astExamTitle" placeholder="Exam or subject" required><input id="astExamDate" type="date"><button class="fc-btn" type="submit">Save exam</button></form><div id="astExams"></div></section>`;
  (document.getElementById('studyHomeActions')||hero)?.insertAdjacentElement('afterend',s);
  $('astTaskToggle').onclick=()=>{$('astTaskForm').hidden=!$('astTaskForm').hidden;if(!$('astTaskForm').hidden)$('astTaskTitle').focus()};
  $('astExamToggle').onclick=()=>{$('astExamForm').hidden=!$('astExamForm').hidden;if(!$('astExamForm').hidden)$('astExamTitle').focus()};
  $('astTaskForm').onsubmit=e=>{e.preventDefault();const title=$('astTaskTitle').value.trim();if(!title)return;const a=read(taskKey,[]);a.push({id:uid(),title,date:$('astTaskDate').value,done:false});write(taskKey,a);$('astTaskTitle').value='';$('astTaskDate').value='';$('astTaskForm').hidden=true;renderHome()};
  $('astExamForm').onsubmit=e=>{e.preventDefault();const title=$('astExamTitle').value.trim();if(!title)return;const a=read(examKey,[]);a.push({id:uid(),title,date:$('astExamDate').value});write(examKey,a);$('astExamTitle').value='';$('astExamDate').value='';$('astExamForm').hidden=true;renderHome()};
 }
 renderHome();return true;
});

function renderHome(){
 const t=$('astTasks'),e=$('astExams');
 if(t){const a=read(taskKey,[]).sort((a,b)=>(a.done-b.done)||((a.date||'9999').localeCompare(b.date||'9999')));t.innerHTML=a.length?a.slice(0,6).map(x=>`<div class="ast-row ${x.done?'ast-done':''}"><label><input type="checkbox" data-taskdone="${x.id}" ${x.done?'checked':''}> <span>${esc(x.title)}</span></label><div class="ast-row-end"><small>${esc(fmtDate(x.date))}</small><button data-taskdel="${x.id}" class="ast-mini-del" aria-label="Delete task">×</button></div></div>`).join(''):'<div class="ast-empty">Nothing due. Enjoy it.</div>';t.querySelectorAll('[data-taskdone]').forEach(c=>c.onchange=()=>{const a=read(taskKey,[]),x=a.find(v=>v.id===c.dataset.taskdone);if(x)x.done=c.checked;write(taskKey,a);renderHome()});t.querySelectorAll('[data-taskdel]').forEach(b=>b.onclick=()=>{write(taskKey,read(taskKey,[]).filter(x=>x.id!==b.dataset.taskdel));renderHome()})}
 if(e){const a=read(examKey,[]).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));e.innerHTML=a.length?a.slice(0,6).map(x=>`<div class="ast-row"><b>${esc(x.title)}</b><div class="ast-row-end"><small>${esc(fmtDate(x.date))}</small><button data-examdel="${x.id}" class="ast-mini-del" aria-label="Delete exam">×</button></div></div>`).join(''):'<div class="ast-empty">Nothing on the horizon.</div>';e.querySelectorAll('[data-examdel]').forEach(b=>b.onclick=()=>{write(examKey,read(examKey,[]).filter(x=>x.id!==b.dataset.examdel));renderHome()})}
}

wait(()=>{
 const view=$('view-mynotes'),form=view?.querySelector('.mn-form'),list=$('mnList');if(!view||!form||!list)return false;
 if(!$('notesTopicFilter')){
  const intro=document.createElement('div');intro.className='notes-chat-import';intro.innerHTML='<b>Notes can stay organized by topic.</b><span>You can also send me notes in ChatGPT and I can add them here for you. Reload the site after I add them.</span>';form.parentElement.insertBefore(intro,form);
  const tools=document.createElement('div');tools.className='notes-topic-tools';tools.innerHTML=`<select id="notesTopicFilter"><option value="all">All topics</option></select><input id="notesSearch" placeholder="Search your notes…">`;form.parentElement.insertBefore(tools,form);
  const upload=document.createElement('div');upload.className='note-upload-box';upload.innerHTML=`<input type="file" id="notePhotoInput" accept="image/*" hidden><button type="button" class="fc-btn secondary" id="notePhotoBtn">📷 Add a photo of my notes</button><small id="notePhotoStatus">Choose a topic above first. The photo will be saved under that topic.</small>`;form.appendChild(upload);
  $('notePhotoBtn').onclick=()=>$('notePhotoInput').click();
  $('notePhotoInput').onchange=async()=>{const file=$('notePhotoInput').files?.[0];if(!file)return;const cat=$('mnCategory').value.trim()||'General',title=$('mnTitle').value.trim()||'Photo note';$('notePhotoStatus').textContent='Preparing photo…';try{const data=await shrink(file);const notes=read('notePhotosV4',[]);notes.push({id:uid(),category:cat,title,image:data});if(!write('notePhotosV4',notes.slice(-20)))throw new Error('storage');$('notePhotoStatus').textContent='Photo saved under '+cat+' ✓';refreshTopics();renderPhotoNotes()}catch{$('notePhotoStatus').textContent='Could not save that photo. Try a smaller image.'}$('notePhotoInput').value=''};
  $('notesTopicFilter').onchange=()=>{filterNotes();renderPhotoNotes()};$('notesSearch').oninput=()=>{filterNotes();renderPhotoNotes()};
  new MutationObserver(()=>{refreshTopics();filterNotes()}).observe(list,{childList:true});
 }
 refreshTopics();filterNotes();renderPhotoNotes();return true;
});

function allNoteTopics(){const list=$('mnList');const fromCards=(typeof flashcards==='object'&&flashcards)?Object.keys(flashcards):[];const fromText=list?[...list.querySelectorAll('.mn-section-title')].map(x=>x.textContent.trim()):[];const fromPhotos=read('notePhotosV4',[]).map(x=>x.category);return [...new Set([...fromCards,...fromText,...fromPhotos,'General'])].filter(Boolean).sort((a,b)=>a.localeCompare(b))}
function refreshTopics(){const f=$('notesTopicFilter');if(!f)return;const keep=f.value;const cats=allNoteTopics();f.innerHTML='<option value="all">All topics</option>'+cats.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');if([...f.options].some(o=>o.value===keep))f.value=keep;const dl=$('mnCategoryList');if(dl)dl.innerHTML=cats.map(x=>`<option value="${esc(x)}"></option>`).join('')}
function filterNotes(){const list=$('mnList');if(!list)return;const f=$('notesTopicFilter')?.value||'all',q=($('notesSearch')?.value||'').toLowerCase();let h=null,on=false;[...list.children].forEach(n=>{if(n.id==='notePhotoGroups')return;if(n.classList.contains('mn-section-title')){if(h)h.style.display=on?'':'none';h=n;on=false;n.style.display='none';return}const show=(f==='all'||h?.textContent.trim()===f)&&(!q||n.textContent.toLowerCase().includes(q));n.style.display=show?'':'none';if(show)on=true});if(h)h.style.display=on?'':'none'}
function renderPhotoNotes(){const list=$('mnList');if(!list)return;let box=$('notePhotoGroups');if(!box){box=document.createElement('div');box.id='notePhotoGroups';list.prepend(box)}const f=$('notesTopicFilter')?.value||'all',q=($('notesSearch')?.value||'').toLowerCase(),a=read('notePhotosV4',[]).filter(x=>(f==='all'||x.category===f)&&(!q||(x.title+' '+x.category).toLowerCase().includes(q)));const groups={};a.forEach(x=>(groups[x.category]??=[]).push(x));box.innerHTML=Object.entries(groups).map(([cat,items])=>`<div class="mn-section-title">${esc(cat)}</div>${items.map(x=>`<div class="mn-card"><div class="mn-title">${esc(x.title)}</div><img src="${x.image}" alt="Saved note photo" style="max-width:100%;border-radius:12px;margin-top:10px"><button class="mn-del" data-photo-del="${x.id}">remove</button></div>`).join('')}`).join('');box.querySelectorAll('[data-photo-del]').forEach(b=>b.onclick=()=>{write('notePhotosV4',read('notePhotosV4',[]).filter(x=>x.id!==b.dataset.photoDel));refreshTopics();renderPhotoNotes()})}
function shrink(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const sc=Math.min(1,1100/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*sc));c.height=Math.max(1,Math.round(im.height*sc));c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.68))};im.src=r.result};r.readAsDataURL(file)})}
window.addEventListener('storage',()=>{renderHome();refreshTopics();renderPhotoNotes()});
})();