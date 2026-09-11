(() => {
  const $ = id => document.getElementById(id);
  const KEY = 'studyRewardsV1';
  const DEFAULTS = { points: 0, rewards: [
    { id: 'reward-game-100', name: 'Buy a game', cost: 100 },
    { id: 'reward-game-300', name: 'Big game / special reward', cost: 300 }
  ]};

  function load(){
    try{
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if(saved && typeof saved === 'object'){
        saved.points = Number.isFinite(+saved.points) ? +saved.points : 0;
        saved.rewards = Array.isArray(saved.rewards) && saved.rewards.length ? saved.rewards : structuredClone(DEFAULTS.rewards);
        return saved;
      }
    }catch{}
    return structuredClone(DEFAULTS);
  }
  function save(state){ localStorage.setItem(KEY, JSON.stringify(state)); }
  let state = load();

  function toast(text){
    let el = $('rewardToast');
    if(!el){ el=document.createElement('div'); el.id='rewardToast'; el.className='reward-toast'; document.body.appendChild(el); }
    el.textContent=text; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),1600);
  }
  function award(amount=2){
    state = load(); state.points += amount; save(state); renderAll(); toast(`+${amount} points ✨`);
  }
  window.addStudyRewardPoints = award;

  function nearestReward(){
    const rewards=[...state.rewards].filter(r=>+r.cost>0).sort((a,b)=>+a.cost-+b.cost);
    return rewards.find(r=>state.points < +r.cost) || rewards[rewards.length-1] || null;
  }
  function progressInfo(){
    const target=nearestReward();
    if(!target) return {target:null,pct:0,left:0};
    const cost=Math.max(1,+target.cost||1), pct=Math.min(100,Math.round(state.points/cost*100));
    return {target,pct,left:Math.max(0,cost-state.points)};
  }

  function mountSettings(){
    const tabs=document.querySelector('.tabs'), wrap=document.querySelector('.wrap');
    if(!tabs||!wrap) return;
    if(!document.querySelector('[data-view="rewards"]')){
      const tab=document.createElement('div'); tab.className='tab'; tab.dataset.view='rewards'; tab.textContent='Settings';
      const progress=tabs.querySelector('[data-view="progress"]'); tabs.insertBefore(tab,progress||null);
      tab.addEventListener('click',()=>{
        document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));
        document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-rewards'));
        renderAll();
      });
    }
    if(!$('view-rewards')){
      const view=document.createElement('div'); view.className='view'; view.id='view-rewards';
      view.innerHTML=`<div class="panel reward-panel">
        <div class="reward-title-row"><div><h2>🎁 Rewards & Points</h2><p>Every correct question and every flashcard you know earns <b>2 points</b>.</p></div><div class="reward-balance"><b id="rewardBalance">0</b><span>points</span></div></div>
        <div class="reward-goal-card"><div class="reward-goal-top"><div><small>Next reward</small><b id="rewardNextName">Buy a game</b></div><strong id="rewardNextText">0 / 100</strong></div><div class="reward-bar"><i id="rewardBarFill"></i></div><p id="rewardGoalHelp" class="reward-help"></p></div>
      </div>
      <div class="panel reward-panel"><h2>Reward settings</h2><p class="reward-help">Change the reward name or how many points it costs. Add as many rewards as you want.</p><div id="rewardRows"></div><button class="fc-btn secondary" id="addRewardBtn">+ Add reward</button></div>`;
      wrap.appendChild(view);
      $('addRewardBtn').onclick=()=>{ state=load(); state.rewards.push({id:crypto.randomUUID(),name:'New reward',cost:100}); save(state); renderAll(); };
    }
  }

  function mountDashboard(){
    const dash=$('view-dashboard'); if(!dash||$('dashRewardWidget')) return;
    const box=document.createElement('div'); box.className='panel dash-reward-widget'; box.id='dashRewardWidget';
    box.innerHTML=`<div class="reward-dash-top"><div><small>Reward points</small><b><span id="dashRewardPoints">0</span> pts</b></div><button class="fc-btn secondary" id="openRewardsBtn">Rewards</button></div><div class="reward-bar"><i id="dashRewardBar"></i></div><div class="reward-dash-bottom" id="dashRewardText"></div>`;
    dash.querySelector('.dash-shell')?.appendChild(box);
    $('openRewardsBtn').onclick=()=>document.querySelector('[data-view="rewards"]')?.click();
  }

  function renderRows(){
    const rows=$('rewardRows'); if(!rows)return;
    rows.innerHTML=state.rewards.map((r,i)=>`<div class="reward-edit-row" data-id="${r.id}"><input class="reward-name-input" value="${String(r.name).replace(/"/g,'&quot;')}" aria-label="Reward name"><label><input class="reward-cost-input" type="number" min="1" step="1" value="${Math.max(1,+r.cost||1)}"> points</label><button class="reward-delete" title="Delete reward">×</button></div>`).join('');
    rows.querySelectorAll('.reward-edit-row').forEach(row=>{
      const id=row.dataset.id, name=row.querySelector('.reward-name-input'), cost=row.querySelector('.reward-cost-input');
      const persist=()=>{ state=load(); const r=state.rewards.find(x=>x.id===id); if(!r)return; r.name=name.value.trim()||'Reward'; r.cost=Math.max(1,Math.round(+cost.value||1)); save(state); renderAll(false); };
      name.addEventListener('change',persist); cost.addEventListener('change',persist);
      row.querySelector('.reward-delete').onclick=()=>{ state=load(); if(state.rewards.length<=1){toast('Keep at least one reward');return;} state.rewards=state.rewards.filter(x=>x.id!==id); save(state); renderAll(); };
    });
  }

  function renderAll(renderRowsToo=true){
    state=load(); const p=progressInfo();
    if($('rewardBalance')) $('rewardBalance').textContent=state.points;
    if(p.target){
      if($('rewardNextName')) $('rewardNextName').textContent=p.target.name;
      if($('rewardNextText')) $('rewardNextText').textContent=`${state.points} / ${p.target.cost}`;
      if($('rewardBarFill')) $('rewardBarFill').style.width=p.pct+'%';
      if($('rewardGoalHelp')) $('rewardGoalHelp').textContent=p.left?`${p.left} more points to reach this reward.`:`You reached this reward! 🎉`;
      if($('dashRewardBar')) $('dashRewardBar').style.width=p.pct+'%';
      if($('dashRewardText')) $('dashRewardText').textContent=p.left?`${p.left} points until ${p.target.name}`:`${p.target.name} reached! 🎉`;
    }
    if($('dashRewardPoints')) $('dashRewardPoints').textContent=state.points;
    if(renderRowsToo) renderRows();
  }

  if(typeof qRecordAttempt === 'function'){
    const original=qRecordAttempt;
    qRecordAttempt=function(subject,correct){ original(subject,correct); if(correct) award(2); };
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('#view-flashcards [data-rate]');
    if(btn && btn.dataset.rate && btn.dataset.rate!=='again') award(2);
  });

  function hookAnswerButton(buttonId, feedbackId, questionId){
    const btn=$(buttonId), feedback=$(feedbackId), question=$(questionId); if(!btn||!feedback||!question)return;
    let cycle=0, rewardedCycle=-1;
    new MutationObserver(()=>{cycle++;}).observe(question,{childList:true,subtree:true,characterData:true});
    btn.addEventListener('click',()=>setTimeout(()=>{
      const text=(feedback.textContent||'').trim().toLowerCase();
      if(rewardedCycle!==cycle && (text.startsWith('✓ correct')||text.startsWith('correct'))){ rewardedCycle=cycle; award(2); }
    },0));
  }
  hookAnswerButton('learnCheck','learnFeedback','learnQ');
  hookAnswerButton('testSubmit','testFeedback','testQ');

  mountSettings();
  [0,500,1500,3000].forEach(ms=>setTimeout(()=>{mountDashboard();renderAll();},ms));
})();