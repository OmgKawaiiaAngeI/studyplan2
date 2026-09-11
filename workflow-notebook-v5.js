(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const iso=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
const today=()=>iso(new Date());
const TASKS='workflowTasksV5',MOODS='workflowMoodsV5',PAGES='workflowPagesV5',STICKERS='workflowStickersV5';
const moodOptions=[{label:'Rough',score:1},{label:'Low',score:2},{label:'Okay',score:3},{label:'Good',score:4},{label:'Great',score:5}];
function wait(fn,n=100){if(fn())return;if(n)setTimeout(()=>wait(fn,n-1),100)}
function fmtDate(v,long=false){if(!v)return'';const d=new Date(v+'T00:00:00');return d.toLocaleDateString(undefined,long?{weekday:'long',month:'long',day:'numeric'}:{month:'short',day:'numeric'})}

wait(()=>{
 const side=$('appSideNav'),main=document.querySelector('.app-main-area');
 if(!side||!main||!window.studyAppShow)return false;
 // Minimal navigation labels, preserving destinations.
 const labels={dashboard:'Home',planner:'Study Plan',mynotes:'Notes',checkins:'My Work',progress:'Progress',mistakes:'Mistake Book',rewards:'Settings & Rewards',tutor:'AI Study Team'};
 side.querySelectorAll('button[data-shellgo]').forEach(b=>{const key=b.dataset.shellgo;if(labels[key])b.textContent=labels[key]});
 if(!side.querySelector('[data-shellgo="workflow"]')){
   const notes=side.querySelector('[data-shellgo="mynotes"]');
   const b=document.createElement('button');b.dataset.shellgo='workflow';b.textContent='Workflow';b.onclick=()=>window.studyAppShow('workflow');
   side.insertBefore(b,notes||side.children[2]||null);
 }
 if(!side.querySelector('[data-shellgo="focus"]')){
   const workflow=side.querySelector('[data-shellgo="workflow"]');
   const b=document.createElement('button');b.dataset.shellgo='focus';b.textContent='Focus';b.onclick=()=>window.studyAppShow('focus');
   workflow?.insertAdjacentElement('afterend',b);
 }
 if(!$('view-workflow')){
   const v=document.createElement('div');v.className='view';v.id='view-workflow';
   main.appendChild(v);
 }
 buildWorkflow();
 cleanDecorativeEmoji();
 return true;
});

function cleanDecorativeEmoji(){
 document.querySelectorAll('.study-home-action .ico,.mode-icon').forEach(x=>x.setAttribute('aria-hidden','true'));
 const study=$('view-study');
 study?.querySelectorAll('h2').forEach(h=>h.textContent=h.textContent.replace(/[\p{Extended_Pictographic}\uFE0F]/gu,'').trim());
}

function buildWorkflow(){
 const v=$('view-workflow');if(!v||v.dataset.ready)return;v.dataset.ready='1';
 v.innerHTML=`<div class="wf-wrap">
   <div class="wf-kicker">Workflow</div><h2 class="wf-title">Workflow.</h2><div class="wf-sub">Tasks, notes, ideas and a small check-in.</div>
   <div class="wf-book">
     <aside class="wf-upcoming"><h4>Upcoming</h4><div id="wfUpcoming"></div></aside>
     <section class="wf-page wf-left">
       <div class="wf-date" id="wfDateLabel"></div>
       <div class="wf-inputrow"><input id="wfTaskTitle" placeholder="Add task"><input id="wfTaskDate" type="date"><button class="wf-btn" id="wfTaskAdd">Add</button></div>
       <div class="wf-inputrow"><button class="wf-btn ghost" id="wfPrevDay">‹ Previous</button><input id="wfDatePicker" type="date"><button class="wf-btn ghost" id="wfNextDay">Next ›</button></div>
       <div id="wfTasks"></div>
     </section>
     <section class="wf-page wf-right">
       <h4>Free page</h4>
       <div class="wf-moods" id="wfMoods"></div>
       <div class="wf-sticker-tools"><input id="wfStickerInput" type="file" accept="image/*" hidden><button class="wf-btn ghost" id="wfStickerUpload">Add sticker image</button><span class="wf-sticker-tray" id="wfStickerTray"></span></div>
       <div class="wf-writing" id="wfWriting"><textarea class="wf-text" id="wfText" placeholder="Write anything — how studying went, an idea, a plan..."></textarea><div class="wf-sticker-layer" id="wfStickerLayer"></div></div>
     </section>
   </div>
   <div class="wf-insights">
     <section class="wf-card"><h3>Mood trend</h3><p>Your last 14 logged days. Kept simple so patterns are easy to notice.</p><div class="wf-chart" id="wfMoodChart"></div></section>
     <section class="wf-card wf-summary"><span>This week</span><strong id="wfMoodAvg">—</strong><p id="wfMoodSummary">Log a few days to see your average.</p></section>
   </div>
 </div>`;
 let current=today();
 const picker=$('wfDatePicker');picker.value=current;
 $('wfTaskDate').value=current;
 const changeDay=d=>{current=iso(d);picker.value=current;$('wfTaskDate').value=current;renderAll()};
 $('wfPrevDay').onclick=()=>{const d=new Date(current+'T12:00:00');d.setDate(d.getDate()-1);changeDay(d)};
 $('wfNextDay').onclick=()=>{const d=new Date(current+'T12:00:00');d.setDate(d.getDate()+1);changeDay(d)};
 picker.onchange=()=>picker.value&&changeDay(new Date(picker.value+'T12:00:00'));
 $('wfTaskAdd').onclick=()=>{const title=$('wfTaskTitle').value.trim();if(!title)return;const a=read(TASKS,[]);a.push({id:uid(),title,date:$('wfTaskDate').value||current,done:false});write(TASKS,a);$('wfTaskTitle').value='';renderTasks();renderUpcoming()};
 $('wfText').addEventListener('input',()=>{const pages=read(PAGES,{});pages[current]=pages[current]||{text:'',stickers:[]};pages[current].text=$('wfText').value;write(PAGES,pages)});
 $('wfStickerUpload').onclick=()=>$('wfStickerInput').click();
 $('wfStickerInput').onchange=async()=>{const file=$('wfStickerInput').files?.[0];if(!file)return;try{const data=await shrink(file,360,.72);const arr=read(STICKERS,[]);arr.push({id:uid(),name:file.name.slice(0,50),data});if(!write(STICKERS,arr.slice(-12)))throw 0;renderStickerTray()}catch{alert('That image could not be saved. Try a smaller image.')}finally{$('wfStickerInput').value=''}};
 function renderAll(){$('wfDateLabel').textContent=fmtDate(current,true);renderTasks();renderUpcoming();renderMoodButtons();renderPage();renderMoodChart()}
 function renderTasks(){const box=$('wfTasks'),a=read(TASKS,[]).filter(x=>x.date===current).sort((a,b)=>Number(a.done)-Number(b.done));box.innerHTML=a.length?a.map(x=>`<div class="wf-task ${x.done?'done':''}"><label><input type="checkbox" data-wftdone="${x.id}" ${x.done?'checked':''}><span>${esc(x.title)}</span></label><button class="wf-del" data-wftdel="${x.id}" aria-label="Delete task">×</button></div>`).join(''):'<div class="wf-empty">A clean page. Add a task to begin.</div>';box.querySelectorAll('[data-wftdone]').forEach(c=>c.onchange=()=>{const all=read(TASKS,[]),x=all.find(y=>y.id===c.dataset.wftdone);if(x)x.done=c.checked;write(TASKS,all);renderTasks();renderUpcoming()});box.querySelectorAll('[data-wftdel]').forEach(b=>b.onclick=()=>{write(TASKS,read(TASKS,[]).filter(x=>x.id!==b.dataset.wftdel));renderTasks();renderUpcoming()})}
 function renderUpcoming(){const box=$('wfUpcoming'),now=today(),a=read(TASKS,[]).filter(x=>!x.done&&x.date>=now).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10);box.innerHTML=a.length?a.map(x=>`<div class="wf-up-item"><span>${esc(x.title)}</span><small>${esc(fmtDate(x.date))}</small></div>`).join(''):'<div class="wf-empty">Nothing scheduled.</div>'}
 function renderMoodButtons(){const box=$('wfMoods'),entry=read(MOODS,[]).find(x=>x.date===current);box.innerHTML=moodOptions.map(m=>`<button class="wf-mood ${entry?.score===m.score?'active':''}" data-score="${m.score}"><span class="wf-mood-dot"></span>${m.label}</button>`).join('');box.querySelectorAll('[data-score]').forEach(b=>b.onclick=()=>{const score=Number(b.dataset.score),all=read(MOODS,[]);const i=all.findIndex(x=>x.date===current),label=moodOptions.find(x=>x.score===score).label;if(i>=0)all[i]={date:current,score,label};else all.push({date:current,score,label});write(MOODS,all);renderMoodButtons();renderMoodChart()})}
 function renderPage(){const pages=read(PAGES,{}),p=pages[current]||{text:'',stickers:[]};$('wfText').value=p.text||'';renderPageStickers(p)}
 function renderStickerTray(){const tray=$('wfStickerTray'),a=read(STICKERS,[]);tray.innerHTML=a.map(x=>`<img class="wf-sticker-thumb" data-sticker="${x.id}" src="${x.data}" alt="${esc(x.name||'Sticker')}">`).join('');tray.querySelectorAll('[data-sticker]').forEach(img=>img.onclick=()=>addSticker(img.dataset.sticker));}
 function addSticker(stickerId){const pages=read(PAGES,{}),p=pages[current]||{text:'',stickers:[]};p.stickers=p.stickers||[];p.stickers.push({id:uid(),stickerId,x:62+Math.round(Math.random()*150),y:100+Math.round(Math.random()*120)});pages[current]=p;write(PAGES,pages);renderPageStickers(p)}
 function renderPageStickers(p){const layer=$('wfStickerLayer'),lib=read(STICKERS,[]);layer.innerHTML='';(p.stickers||[]).forEach(ps=>{const s=lib.find(x=>x.id===ps.stickerId);if(!s)return;const im=document.createElement('img');im.className='wf-page-sticker';im.src=s.data;im.style.left=ps.x+'px';im.style.top=ps.y+'px';im.dataset.pageSticker=ps.id;layer.appendChild(im);const del=document.createElement('button');del.className='wf-sticker-remove';del.textContent='×';del.style.left=(ps.x+64)+'px';del.style.top=(ps.y-5)+'px';del.onclick=()=>{const pages=read(PAGES,{}),page=pages[current]||{text:'',stickers:[]};page.stickers=(page.stickers||[]).filter(x=>x.id!==ps.id);pages[current]=page;write(PAGES,pages);renderPageStickers(page)};layer.appendChild(del);dragSticker(im,del,ps.id)});}
 function dragSticker(im,del,id){let sx=0,sy=0,ox=0,oy=0,moving=false;im.onpointerdown=e=>{moving=true;im.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;ox=parseFloat(im.style.left)||0;oy=parseFloat(im.style.top)||0};im.onpointermove=e=>{if(!moving)return;const host=$('wfWriting').getBoundingClientRect();const nx=Math.max(0,Math.min(host.width-80,ox+e.clientX-sx)),ny=Math.max(0,Math.min(host.height-90,oy+e.clientY-sy));im.style.left=nx+'px';im.style.top=ny+'px';del.style.left=(nx+64)+'px';del.style.top=(ny-5)+'px'};im.onpointerup=()=>{if(!moving)return;moving=false;const pages=read(PAGES,{}),p=pages[current]||{text:'',stickers:[]},x=(p.stickers||[]).find(s=>s.id===id);if(x){x.x=parseFloat(im.style.left)||0;x.y=parseFloat(im.style.top)||0;pages[current]=p;write(PAGES,pages)}}}
 function renderMoodChart(){const box=$('wfMoodChart'),all=read(MOODS,[]).slice().sort((a,b)=>a.date.localeCompare(b.date)).slice(-14);if(!all.length){box.innerHTML='<div class="wf-empty">No mood entries yet.</div>';$('wfMoodAvg').textContent='—';$('wfMoodSummary').textContent='Log a few days to see your average.';return}const W=720,H=150,pad=24,step=all.length===1?0:(W-pad*2)/(all.length-1),y=s=>H-pad-((s-1)/4)*(H-pad*2),pts=all.map((x,i)=>`${pad+i*step},${y(x.score)}`).join(' ');box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mood trend chart"><line x1="${pad}" y1="${y(3)}" x2="${W-pad}" y2="${y(3)}" stroke="#e2d7d3" stroke-dasharray="4 5"/><polyline fill="none" stroke="#6b4653" stroke-width="3" points="${pts}"/>${all.map((x,i)=>`<circle cx="${pad+i*step}" cy="${y(x.score)}" r="5" fill="#6b4653"><title>${esc(fmtDate(x.date))}: ${esc(x.label)}</title></circle><text class="wf-chart-label" x="${pad+i*step}" y="${H-4}" text-anchor="middle">${esc(new Date(x.date+'T00:00:00').toLocaleDateString(undefined,{month:'numeric',day:'numeric'}))}</text>`).join('')}</svg>`;const cutoff=new Date();cutoff.setDate(cutoff.getDate()-6);const week=all.filter(x=>new Date(x.date+'T12:00:00')>=cutoff),avg=week.reduce((s,x)=>s+x.score,0)/(week.length||1);$('wfMoodAvg').textContent=week.length?avg.toFixed(1)+'/5':'—';$('wfMoodSummary').textContent=week.length===1?'1 mood logged this week.':`${week.length} moods logged this week.`}
 renderStickerTray();renderAll();
}

wait(()=>{
 const view=$('view-mynotes'),form=view?.querySelector('.mn-form'),list=$('mnList');if(!view||!form||!list||$('notesNotebookV5'))return false;
 const existingIntro=view.querySelector('.notes-chat-import'),tools=view.querySelector('.notes-topic-tools');
 const book=document.createElement('div');book.id='notesNotebookV5';book.className='notes-notebook-v5';
 const left=document.createElement('section');left.className='notes-page-left';left.innerHTML='<h3 class="notes-book-title">Notes</h3><p class="wf-sub">Add a page, then file it under a topic tab.</p>';
 const right=document.createElement('section');right.className='notes-page-right';right.innerHTML='<h3 class="notes-book-title">Notebook pages</h3>';
 const tabs=document.createElement('div');tabs.className='notes-tabs-v5';tabs.id='notesTabsV5';
 book.append(left,right,tabs);
 form.parentElement.insertBefore(book,existingIntro||form);
 if(existingIntro)left.appendChild(existingIntro);if(tools)left.appendChild(tools);left.appendChild(form);right.appendChild(list);
 function topics(){const a=[];document.querySelectorAll('#mnList .mn-section-title').forEach(x=>a.push(x.textContent.trim()));read('myNotes',[]).forEach(x=>a.push(x.category||'General'));read('notePhotosV4',[]).forEach(x=>a.push(x.category||'General'));return [...new Set(a.filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
 function renderTabs(){const cats=topics(),filter=$('notesTopicFilter'),active=filter?.value||'all';tabs.innerHTML=`<button class="notes-tab-v5 ${active==='all'?'active':''}" data-ntab="all">All</button>`+cats.map(c=>`<button class="notes-tab-v5 ${active===c?'active':''}" data-ntab="${esc(c)}" title="${esc(c)}">${esc(c)}</button>`).join('');tabs.querySelectorAll('[data-ntab]').forEach(b=>b.onclick=()=>{if(filter){filter.value=b.dataset.ntab;filter.dispatchEvent(new Event('change',{bubbles:true}))}renderTabs()})}
 renderTabs();
 new MutationObserver(()=>renderTabs()).observe(list,{childList:true,subtree:true});
 if($('notesTopicFilter'))$('notesTopicFilter').addEventListener('change',renderTabs);
 return true;
});

function shrink(file,max=360,quality=.72){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const sc=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*sc));c.height=Math.max(1,Math.round(im.height*sc));c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/png').length<450000?c.toDataURL('image/png'):c.toDataURL('image/jpeg',quality))};im.src=r.result};r.readAsDataURL(file)})}
})();