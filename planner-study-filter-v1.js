(() => {
  // Keep the planner focused on topics that need real working/practice.
  // Removed after reviewing the site's own question decks against the user's rule:
  // simple percentage/calculator or short 2–3 step money questions.
  const removedNames = new Set([
    'Consumer Arithmetic 1',
    'Consumer Arithmetic 2',
    'Consumer Arithmetic 3',
    'Wages and Salary',
    'Utility Bills, Commission and Exchange Rate'
  ]);

  for (let i = topics.length - 1; i >= 0; i--) {
    if (removedNames.has(topics[i][1])) topics.splice(i, 1);
  }

  const activePageCount = () => topics.reduce((sum,t)=>sum+(t[3]-t[2]+1),0);
  const activeDoneCount = () => topics.reduce((sum,t)=>{
    if (pagesDoneUpTo < t[2]) return sum;
    return sum + Math.max(0, Math.min(pagesDoneUpTo,t[3])-t[2]+1);
  },0);

  // Record the 10 pages the user has already completed (book p.3–12).
  try {
    const current = JSON.parse(localStorage.getItem('pagesDoneUpTo') || '2');
    if (!Number.isFinite(current) || current < 12) localStorage.setItem('pagesDoneUpTo','12');
  } catch(e) {
    try { localStorage.setItem('pagesDoneUpTo','12'); } catch(_) {}
  }

  buildSchedule = function(){
    const days=[];
    let cursor=startDateStr ? new Date(startDateStr+'T00:00:00') : defaultStartDate();
    while(!isWeekday(cursor)) cursor.setDate(cursor.getDate()+1);

    // Build contiguous retained page blocks so removed pages never appear as blank study days.
    const blocks=[];
    topics.forEach(t=>{
      const last=blocks[blocks.length-1];
      if(last && t[2]===last.end+1) last.end=t[3];
      else blocks.push({start:t[2],end:t[3]});
    });

    blocks.forEach(block=>{
      let page=block.start;
      while(page<=block.end){
        const dayEnd=Math.min(page+pagesPerDay-1,block.end);
        const covered=topics.filter(t=>t[2]<=dayEnd && t[3]>=page);
        const hasExam=covered.some(t=>t[0].startsWith('Exam')||t[1].startsWith('Paper'));
        days.push({date:new Date(cursor),startPage:page,endPage:dayEnd,topics:covered,hasExam});
        page=dayEnd+1;
        cursor.setDate(cursor.getDate()+1);
        while(!isWeekday(cursor)) cursor.setDate(cursor.getDate()+1);
      }
    });
    return days;
  };

  renderPlanner = function(){
    const schedule=buildSchedule();
    const today=new Date(); today.setHours(0,0,0,0);
    const body=document.getElementById('scheduleBody'); body.innerHTML='';
    schedule.forEach(day=>{
      const done=day.endPage<=pagesDoneUpTo;
      const el=document.createElement('div');
      el.className='day'+(sameDay(day.date,today)?' today':'')+(day.hasExam?' exam-day':'');
      el.innerHTML=`
        <div class="check ${done?'checked':''}" data-end="${day.endPage}" data-start="${day.startPage}">${done?'&#10003;':''}</div>
        <div class="day-main">
          <div class="date-line"><span>${fmtDate(day.date)}</span><span class="pages">p. ${day.startPage}&ndash;${day.endPage}</span></div>
          <div class="topic-names">${renderTopicNames(day.topics)}</div>
        </div>`;
      el.querySelector('.check').addEventListener('click',()=>{
        pagesDoneUpTo=done ? day.startPage-1 : day.endPage;
        saveProgress(); renderPlanner();
      });
      body.appendChild(el);
    });
    const doneCount=activeDoneCount();
    const total=activePageCount();
    document.getElementById('pagesDoneStat').textContent=doneCount;
    document.getElementById('pagesTotalStat').textContent=total;
    document.getElementById('progressFill').style.width=Math.min(100,(doneCount/total*100))+'%';
    const last=schedule[schedule.length-1];
    document.getElementById('finishDateStat').textContent=last?fmtDate(last.date):'—';
  };
})();