(()=>{
  const TASKS='workflowTasksV5', MOODS='workflowMoodsV5';
  const FROM='2026-09-12', TO='2026-09-11';
  const MIGRATION='workflowSep12ToSep11CorrectionV1';
  try{
    if(localStorage.getItem(MIGRATION)==='done') return;
    const tasks=JSON.parse(localStorage.getItem(TASKS)||'[]');
    let changed=false;
    tasks.forEach(task=>{if(task&&task.date===FROM){task.date=TO;changed=true;}});
    if(changed) localStorage.setItem(TASKS,JSON.stringify(tasks));
    const moods=JSON.parse(localStorage.getItem(MOODS)||'[]');
    const corrected=moods.filter(entry=>!(entry&&entry.date===FROM));
    if(corrected.length!==moods.length) localStorage.setItem(MOODS,JSON.stringify(corrected));
    localStorage.setItem(MIGRATION,'done');
    window.dispatchEvent(new Event('storage'));
  }catch(e){console.error('Workflow date correction failed',e);}
})();