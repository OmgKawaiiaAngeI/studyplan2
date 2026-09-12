(()=>{
  function initManualStudyLog(){
    const timer=document.getElementById('timerDisplay');
    if(!timer || document.getElementById('manualStudyLog')) return;
    const panel=timer.closest('.panel');
    if(!panel) return;

    let totalMinutes=0;
    try{ totalMinutes=Number(JSON.parse(localStorage.getItem('manualStudyMinutes')||'0'))||0; }catch(e){}

    const box=document.createElement('div');
    box.id='manualStudyLog';
    box.style.cssText='margin-top:18px;padding-top:16px;border-top:1px solid var(--line,#eadde3);';
    box.innerHTML=`
      <button class="fc-btn secondary" id="manualStudyToggle" type="button">+ Log study time manually</button>
      <div id="manualStudyForm" style="display:none;margin-top:12px;">
        <div class="row" style="align-items:center;gap:10px;flex-wrap:wrap;">
          <label for="manualStudyMinutes">Minutes studied</label>
          <input id="manualStudyMinutes" type="number" min="1" max="600" step="1" value="30" style="max-width:110px;">
          <button class="fc-btn" id="manualStudyAdd" type="button">Add time + XP</button>
        </div>
        <div id="manualStudyInfo" style="margin-top:8px;font-size:.9rem;opacity:.8;">Every full 25 minutes earns 5 XP, matching the Focus timer.</div>
      </div>
      <div id="manualStudyTotal" style="margin-top:10px;font-size:.9rem;opacity:.85;"></div>`;
    panel.appendChild(box);

    const totalEl=document.getElementById('manualStudyTotal');
    const renderTotal=()=>{ totalEl.textContent=totalMinutes>0 ? `Manually logged study time: ${totalMinutes} minutes` : ''; };
    renderTotal();

    document.getElementById('manualStudyToggle').addEventListener('click',()=>{
      const form=document.getElementById('manualStudyForm');
      const open=form.style.display!=='none';
      form.style.display=open?'none':'block';
      document.getElementById('manualStudyToggle').textContent=open?'+ Log study time manually':'Hide manual entry';
    });

    document.getElementById('manualStudyAdd').addEventListener('click',()=>{
      const input=document.getElementById('manualStudyMinutes');
      const minutes=Math.floor(Number(input.value));
      if(!Number.isFinite(minutes)||minutes<1){
        document.getElementById('manualStudyInfo').textContent='Enter at least 1 minute.';
        return;
      }
      const xp=Math.floor(minutes/25)*5;
      totalMinutes+=minutes;
      try{localStorage.setItem('manualStudyMinutes',JSON.stringify(totalMinutes));}catch(e){}
      if(xp>0 && typeof addXP==='function') addXP(xp);
      if(typeof celebrate==='function') celebrate(`${minutes} minutes logged${xp?`! +${xp} XP`:'!'}`);
      document.getElementById('manualStudyInfo').textContent=xp?`${minutes} minutes added. You earned ${xp} XP.`:`${minutes} minutes added. XP is awarded for each full 25 minutes.`;
      renderTotal();
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initManualStudyLog);
  else initManualStudyLog();
})();