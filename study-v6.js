(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const iso=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
const today=()=>iso(new Date());
const shift=(date,days)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return iso(d)};
const fmt=(v,long=false)=>new Date(v+'T00:00:00').toLocaleDateString(undefined,long?{weekday:'long',month:'long',day:'numeric'}:{month:'short',day:'numeric'});
const TASKS='workflowTasksV5',MOODS='workflowMoodsV5',PAGES='workflowPagesV5',STICKERS='workflowStickersV5',DATES='workflowViewDatesV6';
const moodOptions=[{label:'Rough',score:1},{label:'Low',score:2},{label:'Okay',score:3},{label:'Good',score:4},{label:'Great',score:5}];
function wait(fn,n=120){if(fn())return;if(n)setTimeout(()=>wait(fn,n-1),100)}
function shrink(file,max=360,q=.72){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const sc=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*sc));c.height=Math.max(1,Math.round(im.height*sc));c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',q))};im.src=r.result};r.readAsDataURL(file)})}

function applyTheme(){const t=localStorage.getItem('studyThemeV6')||'pink';document.documentElement.dataset.studyTheme=t;return t}
applyTheme();

/* ---------- Rebuild Workflow with independently flippable pages ---------- */
wait(()=>{
 const v=$('view-workflow');if(!v||!v.querySelector('.wf-book'))return false;
 if(v.dataset.v6==='1')return true;v.dataset.v6='1';
 let dates=read(DATES,{left:today(),right:today()});
 let leftDate=dates.left||today(),rightDate=dates.right||today();
 const saveDates=()=>write(DATES,{left:leftDate,right:rightDate});
 v.innerHTML=`<div class="wf-wrap">
   <div class="wf-kicker">Workflow</div><h2 class="wf-title">Workflow.</h2><div class="wf-sub">Tasks, notes, ideas and a small check-in.</div>
   <div class="wf-book" id="wfBookV6">
     <div class="wf-page-navs-left"><button class="wf-page-nav" id="wfLeftPrev" aria-label="Previous left page">‹</button><button class="wf-page-nav" id="wfLeftNext" aria-label="Next left page">›</button></div>
     <aside class="wf-upcoming"><h4>Upcoming</h4><div id="wfUpcoming"></div></aside>
     <section class="wf-page wf-left">
       <div class="wf-right-head"><div class="wf-date" id="wfDateLabel"></div><input id="wfLeftDatePicker" type="date" aria-label="Left page date"></div>
       <div class="wf-inputrow"><input id="wfTaskTitle" placeholder="Add task"><input id="wfTaskDate" type="date"><button class="wf-btn" id="wfTaskAdd">Add</button></div>
       <div id="wfTasks"></div>
     </section>
     <section class="wf-page wf-right">
       <div class="wf-right-head"><h4>Free page</h4><span class="wf-page-date-mini" id="wfRightDateLabel"></span><input id="wfRightDatePicker" type="date" aria-label="Right page date"></div>
       <div class="wf-moods" id="wfMoods"></div>
       <div class="wf-sticker-tools"><input id="wfStickerInput" type="file" accept="image/*" hidden><button class="wf-btn ghost" id="wfStickerUpload">Add sticker image</button><span class="wf-sticker-tray" id="wfStickerTray"></span></div>
       <div class="wf-writing" id="wfWriting"><textarea class="wf-text" id="wfText" placeholder="Write anything — how studying went, an idea, a plan..."></textarea><div class="wf-sticker-layer" id="wfStickerLayer"></div></div>
     </section>
     <div class="wf-page-navs-right"><button class="wf-page-nav" id="wfRightPrev" aria-label="Previous right page">‹</button><button class="wf-page-nav" id="wfRightNext" aria-label="Next right page">›</button></div>
   </div>
   <div class="wf-insights"><section class="wf-card"><h3>Mood trend</h3><p>Your last 14 logged days.</p><div class="wf-chart" id="wfMoodChart"></div></section><section class="wf-card wf-summary"><span>This week</span><strong id="wfMoodAvg">—</strong><p id="wfMoodSummary">Log a few days to see your average.</p></section></div>
 </div>`;
 const leftPicker=$('wfLeftDatePicker'),rightPicker=$('wfRightDatePicker');
 const setLeft=d=>{leftDate=d;saveDates();renderLeft()};const setRight=d=>{rightDate=d;saveDates();renderRight()};
 $('wfLeftPrev').onclick=()=>setLeft(shift(leftDate,-1));$('wfLeftNext').onclick=()=>setLeft(shift(leftDate,1));
 $('wfRightPrev').onclick=()=>setRight(shift(rightDate,-1));$('wfRightNext').onclick=()=>setRight(shift(rightDate,1));
 leftPicker.onchange=()=>leftPicker.value&&setLeft(leftPicker.value);rightPicker.onchange=()=>rightPicker.value&&setRight(rightPicker.value);
 $('wfTaskAdd').onclick=()=>{const title=$('wfTaskTitle').value.trim();if(!title)return;const a=read(TASKS,[]);a.push({id:uid(),title,date:$('wfTaskDate').value||leftDate,done:false});write(TASKS,a);$('wfTaskTitle').value='';renderLeft();renderUpcoming()};
 $('wfText').oninput=()=>{const pages=read(PAGES,{});pages[rightDate]=pages[rightDate]||{text:'',stickers:[]};pages[rightDate].text=$('wfText').value;write(PAGES,pages)};
 $('wfStickerUpload').onclick=()=>$('wfStickerInput').click();
 $('wfStickerInput').onchange=async()=>{const file=$('wfStickerInput').files?.[0];if(!file)return;try{const data=await shrink(file);const a=read(STICKERS,[]);a.push({id:uid(),name:file.name.slice(0,50),data});if(!write(STICKERS,a.slice(-16)))throw 0;renderStickerTray()}catch{alert('That image could not be saved. Try a smaller image.')}finally{$('wfStickerInput').value=''}};
 function renderUpcoming(){const box=$('wfUpcoming'),a=read(TASKS,[]).filter(x=>!x.done&&x.date>=today()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10);box.innerHTML=a.length?a.map(x=>`<div class="wf-up-item"><span>${esc(x.title)}</span><small>${esc(fmt(x.date))}</small></div>`).join(''):'<div class="wf-empty">Nothing scheduled.</div>'}
 function renderLeft(){leftPicker.value=leftDate;$('wfTaskDate').value=leftDate;$('wfDateLabel').textContent=fmt(leftDate,true);const box=$('wfTasks'),a=read(TASKS,[]).filter(x=>x.date===leftDate).sort((a,b)=>Number(a.done)-Number(b.done));box.innerHTML=a.length?a.map(x=>`<div class="wf-task ${x.done?'done':''}"><label><input type="checkbox" data-done="${x.id}" ${x.done?'checked':''}><span>${esc(x.title)}</span></label><button class="wf-del" data-del="${x.id}">×</button></div>`).join(''):'<div class="wf-empty">A clean page. Add a task to begin.</div>';box.querySelectorAll('[data-done]').forEach(c=>c.onchange=()=>{const all=read(TASKS,[]),x=all.find(y=>y.id===c.dataset.done);if(x)x.done=c.checked;write(TASKS,all);renderLeft();renderUpcoming()});box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{write(TASKS,read(TASKS,[]).filter(x=>x.id!==b.dataset.del));renderLeft();renderUpcoming()})}
 function renderRight(){rightPicker.value=rightDate;$('wfRightDateLabel').textContent=fmt(rightDate);renderMoodButtons();renderPage();renderMoodChart()}
 function renderMoodButtons(){const box=$('wfMoods'),entry=read(MOODS,[]).find(x=>x.date===rightDate);box.innerHTML=moodOptions.map(m=>`<button class="wf-mood ${entry?.score===m.score?'active':''}" data-score="${m.score}"><span class="wf-mood-dot"></span>${m.label}</button>`).join('');box.querySelectorAll('[data-score]').forEach(b=>b.onclick=()=>{const score=Number(b.dataset.score),all=read(MOODS,[]),label=moodOptions.find(x=>x.score===score).label,i=all.findIndex(x=>x.date===rightDate);if(i>=0)all[i]={date:rightDate,score,label};else all.push({date:rightDate,score,label});write(MOODS,all);renderMoodButtons();renderMoodChart()})}
 function renderPage(){const p=read(PAGES,{})[rightDate]||{text:'',stickers:[]};$('wfText').value=p.text||'';renderPageStickers(p)}
 function renderStickerTray(){const tray=$('wfStickerTray'),a=read(STICKERS,[]);tray.innerHTML=a.map(x=>`<img class="wf-sticker-thumb" data-sticker="${x.id}" src="${x.data}" alt="${esc(x.name||'Sticker')}">`).join('');tray.querySelectorAll('[data-sticker]').forEach(img=>img.onclick=()=>addSticker(img.dataset.sticker))}
 function addSticker(stickerId){const pages=read(PAGES,{}),p=pages[rightDate]||{text:'',stickers:[]};p.stickers=p.stickers||[];p.stickers.push({id:uid(),stickerId,x:30+Math.round(Math.random()*180),y:80+Math.round(Math.random()*150)});pages[rightDate]=p;write(PAGES,pages);renderPageStickers(p)}
 function renderPageStickers(p){const layer=$('wfStickerLayer'),lib=read(STICKERS,[]);layer.innerHTML='';(p.stickers||[]).forEach(ps=>{const s=lib.find(x=>x.id===ps.stickerId);if(!s)return;const im=document.createElement('img');im.className='wf-page-sticker';im.src=s.data;im.style.left=ps.x+'px';im.style.top=ps.y+'px';layer.appendChild(im);const del=document.createElement('button');del.className='wf-sticker-remove';del.textContent='×';del.style.left=(ps.x+64)+'px';del.style.top=(ps.y-5)+'px';del.onclick=()=>{const pages=read(PAGES,{}),page=pages[rightDate]||{text:'',stickers:[]};page.stickers=(page.stickers||[]).filter(x=>x.id!==ps.id);pages[rightDate]=page;write(PAGES,pages);renderPageStickers(page)};layer.appendChild(del);drag(im,del,ps.id)})}
 function drag(im,del,id){let sx=0,sy=0,ox=0,oy=0,m=false;im.onpointerdown=e=>{m=true;im.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;ox=parseFloat(im.style.left)||0;oy=parseFloat(im.style.top)||0};im.onpointermove=e=>{if(!m)return;const host=$('wfWriting').getBoundingClientRect(),x=Math.max(0,Math.min(host.width-80,ox+e.clientX-sx)),y=Math.max(0,Math.min(host.height-90,oy+e.clientY-sy));im.style.left=x+'px';im.style.top=y+'px';del.style.left=(x+64)+'px';del.style.top=(y-5)+'px'};im.onpointerup=()=>{if(!m)return;m=false;const pages=read(PAGES,{}),p=pages[rightDate]||{text:'',stickers:[]},x=(p.stickers||[]).find(s=>s.id===id);if(x){x.x=parseFloat(im.style.left)||0;x.y=parseFloat(im.style.top)||0;pages[rightDate]=p;write(PAGES,pages)}}}
 function renderMoodChart(){const box=$('wfMoodChart'),all=read(MOODS,[]).slice().sort((a,b)=>a.date.localeCompare(b.date)).slice(-14);if(!all.length){box.innerHTML='<div class="wf-empty">No mood entries yet.</div>';$('wfMoodAvg').textContent='—';$('wfMoodSummary').textContent='Log a few days to see your average.';return}const W=720,H=150,p=24,step=all.length===1?0:(W-p*2)/(all.length-1),y=s=>H-p-((s-1)/4)*(H-p*2),pts=all.map((x,i)=>`${p+i*step},${y(x.score)}`).join(' ');box.innerHTML=`<svg viewBox="0 0 ${W} ${H}"><line x1="${p}" y1="${y(3)}" x2="${W-p}" y2="${y(3)}" stroke="currentColor" opacity=".14" stroke-dasharray="4 5"/><polyline fill="none" stroke="currentColor" stroke-width="3" points="${pts}"/>${all.map((x,i)=>`<circle cx="${p+i*step}" cy="${y(x.score)}" r="5" fill="currentColor"><title>${esc(fmt(x.date))}: ${esc(x.label)}</title></circle>`).join('')}</svg>`;const cutoff=new Date();cutoff.setDate(cutoff.getDate()-6);const week=all.filter(x=>new Date(x.date+'T12:00:00')>=cutoff),avg=week.reduce((s,x)=>s+x.score,0)/(week.length||1);$('wfMoodAvg').textContent=week.length?avg.toFixed(1)+'/5':'—';$('wfMoodSummary').textContent=week.length===1?'1 mood logged this week.':`${week.length} moods logged this week.`}
 renderStickerTray();renderUpcoming();renderLeft();renderRight();return true;
});

/* ---------- Sidebar Extra dropdown ---------- */
wait(()=>{
 const side=$('appSideNav');if(!side||$('sp6Extra'))return false;
 const details=document.createElement('details');details.id='sp6Extra';details.className='sp6-extra';details.innerHTML=`<summary>Extra</summary><div class="sp6-extra-menu"><button data-extra="study">Study hub</button><button data-extra="flashcards">Flashcards</button><button data-extra="questions">Practice Questions</button><button data-extra="learn">Learn Mode</button><button data-extra="test">Test Mode</button><button data-extra="importer">Add AI Notes & Flashcards</button></div>`;
 const settingsLabel=[...side.querySelectorAll('.secondary-section-label')].find(x=>/settings/i.test(x.textContent));side.insertBefore(details,settingsLabel||$('sp6AccountBox')||null);
 details.querySelectorAll('[data-extra]').forEach(b=>b.onclick=()=>{const n=b.dataset.extra;if(n==='importer')showImporter();else window.studyAppShow?.(n);details.open=false});
 return true;
});

/* ---------- Import custom flashcards on every load ---------- */
wait(()=>{try{if(typeof flashcards==='undefined')return false;const saved=read('userFlashcardsV6',{});for(const [topic,cards] of Object.entries(saved)){flashcards[topic] ||= [];for(const c of cards){if(!flashcards[topic].some(x=>x[0]===c[0]&&x[1]===c[1]))flashcards[topic].push(c)}}const sel=$('topicSelect');if(sel){for(const topic of Object.keys(saved)){if(![...sel.options].some(o=>o.value===topic||o.textContent===topic)){const o=document.createElement('option');o.value=topic;o.textContent=topic;sel.appendChild(o)}}}return true}catch{return false}},80);

function inferTopic(text){const s=text.toLowerCase(),rules=[['Algebra',['algebra','equation','factor','expand','quadratic','variable']],['Geometry and Trigonometry',['trig','sine','cosine','tangent','triangle','angle','circle','bearing']],['Statistics',['mean','median','mode','frequency','standard deviation','statistics']],['Probability',['probability','chance','outcome','sample space']],['Sets',['venn','subset','union','intersection','set ']],['Consumer Arithmetic',['interest','discount','profit','vat','salary','wage','exchange rate']],['Matrices',['matrix','matrices','determinant']],['Relations, Functions and Graphs',['function','gradient','graph','coordinate']],['Number Theory',['prime','factor','multiple','integer','fraction','ratio','scientific notation']]];for(const [t,words] of rules)if(words.some(w=>s.includes(w)))return t;return 'General'}
function parseNoteBlocks(raw,fallbackTitle){const lines=raw.split(/\r?\n/),out=[];let cur={topic:'',title:'',body:[]};const finish=()=>{const body=cur.body.join('\n').trim();if(body)out.push({topic:cur.topic||inferTopic(body),title:cur.title||fallbackTitle||'AI study notes',body});cur={topic:'',title:'',body:[]}};for(const line of lines){let m=line.match(/^\s*TOPIC\s*:\s*(.+)$/i);if(m){if(cur.body.length)finish();cur.topic=m[1].trim();continue}m=line.match(/^\s*TITLE\s*:\s*(.+)$/i);if(m){cur.title=m[1].trim();continue}cur.body.push(line)}finish();return out}
function parseCards(raw,fallback){let topic=fallback||'',out={};for(const line0 of raw.split(/\r?\n/)){const line=line0.trim();if(!line)continue;const m=line.match(/^TOPIC\s*:\s*(.+)$/i);if(m){topic=m[1].trim();continue}const i=line.indexOf('||');if(i<1)continue;const q=line.slice(0,i).trim(),a=line.slice(i+2).trim(),t=topic||inferTopic(q+' '+a);if(q&&a)(out[t]??=[]).push([q,a])}return out}
function showImporter(){
 let v=$('view-importer');if(!v){v=document.createElement('div');v.id='view-importer';v.className='view';document.querySelector('.app-main-area')?.appendChild(v);v.innerHTML=`<div class="sp6-importer"><div class="wf-kicker">Extra</div><h2>Add AI Notes & Flashcards</h2><p>Ask ChatGPT or another AI to use the formats below, paste the result here, and the site files everything by topic.</p><div class="sp6-import-grid">
 <section class="sp6-import-card"><h3>Import notes</h3><input id="sp6NoteTitle" placeholder="Fallback title (optional)"><textarea id="sp6NoteText" placeholder="TOPIC: Algebra\nTITLE: Solving equations\nYour notes here...\n\nTOPIC: Trigonometry\nTITLE: SOHCAHTOA\nMore notes..."></textarea><div class="sp6-format">Best format:\nTOPIC: topic name\nTITLE: note title\nnotes...</div><div class="sp6-import-actions"><button id="sp6CopyNotePrompt">Copy AI prompt</button><button id="sp6ImportNotes">Import notes</button></div><div id="sp6NoteMsg" class="sp6-msg"></div></section>
 <section class="sp6-import-card"><h3>Import flashcards</h3><input id="sp6CardTopic" placeholder="Fallback topic (optional)"><textarea id="sp6CardText" placeholder="TOPIC: Algebra\nWhat is a coefficient? || The number multiplying a variable.\nSolve 2x=8. || x=4\n\nTOPIC: Sets\nWhat is a union? || Everything in either set."></textarea><div class="sp6-format">Best format:\nTOPIC: topic name\nQuestion || Answer\nQuestion || Answer</div><div class="sp6-import-actions"><button id="sp6CopyCardPrompt">Copy AI prompt</button><button id="sp6ImportCards">Import flashcards</button></div><div id="sp6CardMsg" class="sp6-msg"></div></section></div></div>`;
 const copy=(text,msg)=>navigator.clipboard?.writeText(text).then(()=>{$(msg).textContent='Prompt copied.'}).catch(()=>{$(msg).textContent='Copy this format manually if clipboard access is blocked.'});
 $('sp6CopyNotePrompt').onclick=()=>copy('Turn my material into study notes. Output only blocks in this exact format: TOPIC: <topic name> then TITLE: <note title> then the notes. You may create multiple TOPIC blocks. Keep definitions, rules, formulas, examples and common mistakes.','sp6NoteMsg');
 $('sp6CopyCardPrompt').onclick=()=>copy('Create flashcards from my material. Group them by topic. Output only this exact format: TOPIC: <topic name> then one flashcard per line as Question || Answer. You may create multiple TOPIC blocks.','sp6CardMsg');
 $('sp6ImportNotes').onclick=()=>{const raw=$('sp6NoteText').value.trim();if(!raw){$('sp6NoteMsg').textContent='Paste notes first.';return}const blocks=parseNoteBlocks(raw,$('sp6NoteTitle').value.trim());try{if(typeof myNotes!=='undefined'){blocks.forEach(b=>myNotes.push({id:uid(),category:b.topic,title:b.title,body:b.body}));saveMn();populateMnCategoryList();renderMnList()}else{const a=read('myNotes',[]);blocks.forEach(b=>a.push({id:uid(),category:b.topic,title:b.title,body:b.body}));write('myNotes',a)}$('sp6NoteText').value='';$('sp6NoteMsg').textContent=`Imported ${blocks.length} note section${blocks.length===1?'':'s'} into topic tabs.`}catch(e){$('sp6NoteMsg').textContent='Could not import those notes.'}};
 $('sp6ImportCards').onclick=()=>{const raw=$('sp6CardText').value.trim();if(!raw){$('sp6CardMsg').textContent='Paste flashcards first.';return}const parsed=parseCards(raw,$('sp6CardTopic').value.trim()),saved=read('userFlashcardsV6',{});let count=0;for(const [topic,cards] of Object.entries(parsed)){saved[topic] ||= [];for(const c of cards){if(!saved[topic].some(x=>x[0]===c[0]&&x[1]===c[1])){saved[topic].push(c);count++}if(typeof flashcards!=='undefined'){flashcards[topic] ||= [];if(!flashcards[topic].some(x=>x[0]===c[0]&&x[1]===c[1]))flashcards[topic].push(c)}}}write('userFlashcardsV6',saved);const sel=$('topicSelect');if(sel)for(const topic of Object.keys(parsed)){if(![...sel.options].some(o=>o.value===topic||o.textContent===topic)){const o=document.createElement('option');o.value=topic;o.textContent=topic;sel.appendChild(o)}}$('sp6CardText').value='';$('sp6CardMsg').textContent=count?`Imported ${count} flashcard${count===1?'':'s'} into their topics.`:'No new cards found.'};}
 window.studyAppShow?.('importer');
}

/* ---------- Themes and backups in Settings ---------- */
wait(()=>{
 const v=$('view-rewards');if(!v||$('sp6ThemeSettings'))return false;
 const host=v.querySelector('.panel')||v;
 const block=document.createElement('div');block.id='sp6ThemeSettings';block.className='sp6-settings-block';
 block.innerHTML=`<h3>Appearance</h3><p>Choose a color set for your whole planner.</p><div class="sp6-theme-grid">
 <button class="sp6-theme" data-theme="pink"><span class="sp6-theme-swatches"><i style="background:#fff9fa"></i><i style="background:#4a2633"></i></span>Pink / cream</button>
 <button class="sp6-theme" data-theme="green"><span class="sp6-theme-swatches"><i style="background:#f7f8f2"></i><i style="background:#486247"></i></span>Green / brown</button>
 <button class="sp6-theme" data-theme="mono"><span class="sp6-theme-swatches"><i style="background:#fff"></i><i style="background:#111"></i></span>White / black</button>
 <button class="sp6-theme" data-theme="gray"><span class="sp6-theme-swatches"><i style="background:#f5f5f3"></i><i style="background:#686c70"></i></span>Gray / white</button></div></div>
 <div class="sp6-settings-block"><h3>Account data backup</h3><p>Your study data saves automatically to this account on this browser. Export a backup before clearing browser data or changing devices.</p><div class="sp6-backup-row"><button id="sp6Export">Export my backup</button><label>Restore backup<input id="sp6Restore" type="file" accept="application/json" hidden></label></div><div id="sp6BackupMsg" class="sp6-msg"></div></div>`;
 host.insertAdjacentElement('beforebegin',block);
 const theme=applyTheme();block.querySelectorAll('[data-theme]').forEach(b=>{b.classList.toggle('active',b.dataset.theme===theme);b.onclick=()=>{localStorage.setItem('studyThemeV6',b.dataset.theme);applyTheme();block.querySelectorAll('[data-theme]').forEach(x=>x.classList.toggle('active',x===b))}});
 $('sp6Export').onclick=()=>{const p=window.StudyAccounts?.prefix?.();if(!p){$('sp6BackupMsg').textContent='Sign in first.';return}const data={version:6,exportedAt:new Date().toISOString(),account:window.StudyAccounts?.current?.()?.username||'',data:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(p))data.data[k.slice(p.length)]=window.StudyAccounts.rawGet(k)}const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`study-plan-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('sp6BackupMsg').textContent='Backup exported.'};
 $('sp6Restore').onchange=async()=>{const file=$('sp6Restore').files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());if(!obj?.data||typeof obj.data!=='object')throw 0;for(const [k,v] of Object.entries(obj.data))localStorage.setItem(k,v);$('sp6BackupMsg').textContent='Backup restored. Reloading…';setTimeout(()=>location.reload(),500)}catch{$('sp6BackupMsg').textContent='That backup file is not valid.'}};
 return true;
});

window.addEventListener('storage',()=>applyTheme());
})();