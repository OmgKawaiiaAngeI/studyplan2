(() => {
  const byId=id=>document.getElementById(id);
  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const now=()=>Date.now();
  const DAY=86400000;

  // ---------- Flashcards: spaced repetition ----------
  let srs={};
  try{srs=JSON.parse(localStorage.getItem('fcSrsV2')||'{}')}catch{srs={}}
  const saveSrs=()=>localStorage.setItem('fcSrsV2',JSON.stringify(srs));
  function srsKey(){ return fcCardKey(currentTopic,currentIndex); }
  function getSrs(key){ return srs[key]||{level:0,due:0,last:0,reviews:0}; }
  function dueLabel(rec){
    if(!rec.due||rec.due<=now()) return 'Due now';
    const mins=Math.ceil((rec.due-now())/60000);
    if(mins<60) return `Due in ${mins} min`;
    const hrs=Math.ceil(mins/60); if(hrs<24) return `Due in ${hrs} hr`;
    return `Due in ${Math.ceil(hrs/24)} day${Math.ceil(hrs/24)===1?'':'s'}`;
  }
  function pickNextDue(){
    const deck=flashcards[currentTopic];
    const candidates=deck.map((_,i)=>({i,r:getSrs(fcCardKey(currentTopic,i))}));
    const due=candidates.filter(x=>!x.r.due||x.r.due<=now());
    const pool=due.length?due:candidates.sort((a,b)=>(a.r.due||0)-(b.r.due||0)).slice(0,Math.min(4,candidates.length));
    return pool[Math.floor(Math.random()*pool.length)].i;
  }
  function rateCard(rating){
    const key=srsKey(),rec=getSrs(key); rec.reviews=(rec.reviews||0)+1; rec.last=now();
    if(rating==='again'){rec.level=0;rec.due=now()+10*60000;cardMastery[key]=1;}
    if(rating==='hard'){rec.level=Math.max(1,rec.level||0);rec.due=now()+DAY;cardMastery[key]=1;}
    if(rating==='good'){rec.level=Math.min(5,(rec.level||0)+1);rec.due=now()+Math.max(3,rec.level*3)*DAY;cardMastery[key]=2;addXP(1);}
    if(rating==='easy'){rec.level=Math.min(6,(rec.level||0)+2);rec.due=now()+Math.max(7,rec.level*5)*DAY;cardMastery[key]=2;addXP(1);}
    srs[key]=rec; saveSrs(); fcSaveMastery(); fcReviewCount=(fcReviewCount||0)+1; gSave();
    currentIndex=pickNextDue(); renderCard(); renderUpgradeProgress();
  }
  const flashView=byId('view-flashcards');
  if(flashView){
    const oldKnow=flashView.querySelector('.know-row'); if(oldKnow) oldKnow.style.display='none';
    const controls=document.createElement('div'); controls.className='srs-wrap'; controls.innerHTML=`
      <div class="srs-head"><b>How well did you know it?</b><span id="srsDueLabel">Due now</span></div>
      <div class="srs-buttons">
        <button data-rate="again">Again<small>10 min</small></button>
        <button data-rate="hard">Hard<small>1 day</small></button>
        <button data-rate="good">Good<small>3+ days</small></button>
        <button data-rate="easy">Easy<small>7+ days</small></button>
      </div>`;
    oldKnow?.insertAdjacentElement('afterend',controls);
    controls.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>rateCard(b.dataset.rate)));
    const originalRender=renderCard;
    renderCard=function(){ originalRender(); const el=byId('srsDueLabel'); if(el)el.textContent=dueLabel(getSrs(srsKey())); };
    renderCard();
  }

  // ---------- Mistake Book ----------
  let mistakes=[];
  try{mistakes=JSON.parse(localStorage.getItem('mistakeBookV2')||'[]')}catch{mistakes=[]}
  const saveMistakes=()=>localStorage.setItem('mistakeBookV2',JSON.stringify(mistakes));
  function addMistake(item){
    const key=item.subject+'|'+item.q;
    const existing=mistakes.find(m=>m.key===key);
    if(existing){existing.count++;existing.last=Date.now();}
    else mistakes.unshift({key,subject:item.subject,q:item.q,a:item.a,idx:item.idx,count:1,last:Date.now(),mastered:false});
    saveMistakes(); renderMistakes(); renderUpgradeProgress();
  }
  const originalRecord=qRecordAttempt;
  qRecordAttempt=function(subject,correct){
    if(!correct){const item=qCurrentDeck()[qIndex]; if(item)addMistake(item);}
    originalRecord(subject,correct);
  };
  const tabs=document.querySelector('.tabs');
  if(tabs&&!document.querySelector('[data-view="mistakes"]')){
    const tab=document.createElement('div');tab.className='tab';tab.dataset.view='mistakes';tab.textContent='Mistakes';
    const progressTab=tabs.querySelector('[data-view="progress"]');tabs.insertBefore(tab,progressTab||null);
    const wrap=document.querySelector('.wrap'); const view=document.createElement('div');view.className='view';view.id='view-mistakes';
    view.innerHTML=`<div class="panel"><div class="upgrade-heading"><div><h2>📕 Mistake Book</h2><p>Questions you got wrong are saved here automatically. Retry them until they stick.</p></div><button class="fc-btn secondary" id="clearMasteredMistakes">Clear mastered</button></div><div id="mistakeSummary" class="mistake-summary"></div><div id="mistakeList" class="mistake-list"></div></div>`;
    wrap.appendChild(view);
    tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));tab.classList.add('active');view.classList.add('active');renderMistakes();});
    byId('clearMasteredMistakes').addEventListener('click',()=>{mistakes=mistakes.filter(m=>!m.mastered);saveMistakes();renderMistakes();renderUpgradeProgress();});
  }
  function renderMistakes(){
    const list=byId('mistakeList'),summary=byId('mistakeSummary'); if(!list)return;
    const active=mistakes.filter(m=>!m.mastered).length;
    summary.textContent=mistakes.length?`${active} to review · ${mistakes.length-active} mastered`:'Nothing here yet — mistakes you make in Practice will appear here.';
    list.innerHTML=mistakes.length?mistakes.map((m,i)=>`<div class="mistake-card ${m.mastered?'mastered':''}"><div class="mistake-top"><span>${safe(m.subject)}</span><small>missed ${m.count}×</small></div><b>${safe(m.q)}</b><div class="mistake-answer"><strong>Answer:</strong> ${safe(m.a)}</div><div class="mistake-actions"><button data-retry="${i}">Retry</button><button data-master="${i}">${m.mastered?'Mark for review':'I understand this ✓'}</button></div></div>`).join(''):'<div class="ci-empty">No mistakes saved yet 🎉</div>';
    list.querySelectorAll('[data-master]').forEach(b=>b.onclick=()=>{mistakes[+b.dataset.master].mastered=!mistakes[+b.dataset.master].mastered;saveMistakes();renderMistakes();renderUpgradeProgress();});
    list.querySelectorAll('[data-retry]').forEach(b=>b.onclick=()=>{const m=mistakes[+b.dataset.retry];qQuickMode=false;qSubject=m.subject;qIndex=Math.max(0,m.idx||0);byId('qSubject').value=qSubject;qRenderQuestion();document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view==='questions'));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-questions'));});
  }
  renderMistakes();

  // ---------- Clear question explanations ----------
  const explanations={
    'If A = {2, 4, 6, 8} and B = {4, 8, 12}, find A ∩ B.':'Intersection means values that appear in both sets. Only 4 and 8 are shared.',
    'If A = {2, 4, 6, 8} and B = {4, 8, 12}, find A ∪ B.':'Union means combine both sets, writing each value only once.',
    "If U = {1,2,3,4,5,6,7,8,9,10} and A = {1,3,5,7,9}, find A'.":"The complement A′ contains everything in the universal set U that is not in A.",
    'If n(A)=7, n(B)=5, and n(A∩B)=3, find n(A∪B).':'Use n(A∪B)=n(A)+n(B)−n(A∩B). We subtract the intersection once because it was counted twice.',
    'Round 6.2384 to 3 significant figures.':'Start counting at the first non-zero digit: 6, 2, 3. The next digit is 8, so round the 3 up to 4.',
    'Round 0.00592 to 2 significant figures.':'Leading zeros are not significant. The first two significant digits are 5 and 9; the next digit is 2, so 59 stays unchanged.',
    'Round 78,650 to 2 significant figures.':'The first two significant digits are 7 and 8. The next digit is 6, so 78 rounds up to 79, then restore the place-value zeros.',
    'Simplify 8/12.':'The HCF of 8 and 12 is 4. Divide numerator and denominator by 4 to get 2/3.',
    'Add 1/3 + 1/6.':'Use a common denominator of 6: 1/3=2/6, then 2/6+1/6=3/6=1/2.',
    'Convert 5/8 to a decimal.':'A fraction means division, so calculate 5 ÷ 8 = 0.625.',
    'Write 56,000 in scientific notation.':'Move the decimal 4 places left to make 5.6. Moving left gives a positive exponent: 5.6 × 10⁴.',
    'Write 0.00073 in scientific notation.':'Move the decimal 4 places right to make 7.3. A small number gives a negative exponent: 7.3 × 10⁻⁴.',
    'Simplify the ratio 24:36.':'The HCF of 24 and 36 is 12. Divide both parts by 12 to get 2:3.',
    'Share $600 in the ratio 1:2:3.':'Add the ratio parts: 1+2+3=6. Each part is $600÷6=$100, giving $100, $200 and $300.'
  };
  byId('qShowAnswer')?.addEventListener('click',()=>{
    const item=qCurrentDeck()[qIndex]; if(!item)return;
    let box=byId('qExplanation'); if(!box){box=document.createElement('div');box.id='qExplanation';box.className='q-explanation';byId('qAnswer').insertAdjacentElement('afterend',box);}
    box.innerHTML=`<strong>Why / method:</strong><br>${safe(explanations[item.q]||item.a)}`;box.style.display='block';
  });
  const originalQRender=qRenderQuestion;
  qRenderQuestion=function(){originalQRender();const box=byId('qExplanation');if(box)box.style.display='none';};

  // ---------- Adjustable focus timer ----------
  const timerPanel=byId('timerDisplay')?.closest('.panel');
  let timerPrefs={focus:25,break:5}; try{timerPrefs=Object.assign(timerPrefs,JSON.parse(localStorage.getItem('timerPrefsV2')||'{}'))}catch{}
  if(timerPanel&&!byId('focusMinutesInput')){
    const settings=document.createElement('div');settings.className='timer-settings';settings.innerHTML=`<label>Focus <input id="focusMinutesInput" type="number" min="1" max="180" value="${timerPrefs.focus}"> min</label><label>Break <input id="breakMinutesInput" type="number" min="1" max="60" value="${timerPrefs.break}"> min</label>`;
    byId('timerMode').insertAdjacentElement('afterend',settings);
    const resetOld=byId('timerReset'),toggleOld=byId('timerToggle');
    const reset=resetOld.cloneNode(true),toggle=toggleOld.cloneNode(true);resetOld.replaceWith(reset);toggleOld.replaceWith(toggle);
    function readPrefs(){timerPrefs.focus=Math.max(1,Math.min(180,+byId('focusMinutesInput').value||25));timerPrefs.break=Math.max(1,Math.min(60,+byId('breakMinutesInput').value||5));localStorage.setItem('timerPrefsV2',JSON.stringify(timerPrefs));}
    byId('focusMinutesInput').onchange=()=>{readPrefs();if(!timerRunning&&timerMode==='focus'){timerSeconds=timerPrefs.focus*60;timerRender();}};
    byId('breakMinutesInput').onchange=readPrefs;
    toggle.onclick=()=>{timerRunning=!timerRunning;toggle.textContent=timerRunning?'Pause':'Start';if(timerRunning)timerInterval=setInterval(timerTick,1000);else clearInterval(timerInterval);};
    reset.onclick=()=>{clearInterval(timerInterval);timerRunning=false;readPrefs();timerMode='focus';timerSeconds=timerPrefs.focus*60;toggle.textContent='Start';timerRender();};
    timerTick=function(){timerSeconds--;if(timerSeconds<=0){if(timerMode==='focus'){let total=+(localStorage.getItem('focusMinutesV2')||0);total+=timerPrefs.focus;localStorage.setItem('focusMinutesV2',String(total));addXP(5);celebrate(`Focus session done! ${timerPrefs.focus} min 🎉`);timerMode='break';timerSeconds=timerPrefs.break*60;}else{celebrate("Break's over — ready for another round?");timerMode='focus';timerSeconds=timerPrefs.focus*60;}}timerRender();};
    timerSeconds=timerPrefs.focus*60;timerRender();
  }

  // ---------- Better progress ----------
  const progressView=byId('view-progress');
  if(progressView&&!byId('upgradeProgress')){
    const box=document.createElement('div');box.id='upgradeProgress';box.innerHTML=`<div class="panel"><h2>Study overview</h2><div class="upgrade-stats" id="upgradeStats"></div></div><div class="panel"><h2>Topic mastery</h2><p class="progress-help">Based on your Practice answers. More attempts make this more useful.</p><div id="topicMasteryList"></div></div><div class="panel"><h2>Flashcard mastery</h2><div id="flashMasteryProgress"></div></div>`;
    const first=progressView.querySelector('.panel');first?.insertAdjacentElement('afterend',box);
  }
  function renderUpgradeProgress(){
    if(!byId('upgradeProgress'))return;
    const done=Math.max(0,pagesDoneUpTo-BOOK_START+1),pagePct=Math.round(done/TOTAL_PAGES*100),focus=+(localStorage.getItem('focusMinutesV2')||0),activeMistakes=mistakes.filter(m=>!m.mastered).length;
    const allKeys=[];Object.keys(flashcards).forEach(t=>flashcards[t].forEach((_,i)=>allKeys.push(fcCardKey(t,i))));
    const reviewed=allKeys.filter(k=>getSrs(k).reviews>0).length,mastered=allKeys.filter(k=>getSrs(k).level>=3).length,due=allKeys.filter(k=>getSrs(k).reviews>0&&getSrs(k).due<=now()).length;
    byId('upgradeStats').innerHTML=`<div><b>${pagePct}%</b><span>book complete</span></div><div><b>${focus}</b><span>focus minutes</span></div><div><b>${activeMistakes}</b><span>mistakes to review</span></div><div><b>${reviewed}</b><span>cards reviewed</span></div>`;
    const subjects=Object.keys(qAttempts);byId('topicMasteryList').innerHTML=subjects.length?subjects.sort((a,b)=>{const A=qAttempts[a],B=qAttempts[b];return A.right/(A.right+A.wrong||1)-B.right/(B.right+B.wrong||1)}).map(s=>{const x=qAttempts[s],n=x.right+x.wrong,p=n?Math.round(x.right/n*100):0;return `<div class="mastery-row"><div><b>${safe(s)}</b><small>${x.right}/${n} correct</small></div><div class="mini-track"><i style="width:${p}%"></i></div><strong>${p}%</strong></div>`}).join(''):'<div class="ci-empty">Answer some Practice questions to build topic mastery.</div>';
    const pct=allKeys.length?Math.round(mastered/allKeys.length*100):0;byId('flashMasteryProgress').innerHTML=`<div class="mastery-row"><div><b>${mastered} mastered</b><small>${due} due now · ${reviewed}/${allKeys.length} reviewed</small></div><div class="mini-track"><i style="width:${pct}%"></i></div><strong>${pct}%</strong></div>`;
  }
  const oldProgress=renderProgressTab;renderProgressTab=function(){oldProgress();renderUpgradeProgress();};
  renderUpgradeProgress();
})();