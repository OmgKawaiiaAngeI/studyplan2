/* ---------------- Planner data ---------------- */
const topics = [
["Assignment 1","Directed Numbers, Basic Operators, BODMAS",3,4],
["Assignment 2","Types of Numbers, Fractions, Calculator Use",5,7],
["Assignment 3","Even, Composite, Prime, Approximations, Revision",8,12],
["Assignment 4","Long Division, Scientific Notation, Ratios",13,16],
["Exam 1","Exam 1",17,22],
["Assignment 6","Consumer Arithmetic 1",23,28],
["Assignment 7","Consumer Arithmetic 2",29,33],
["Assignment 8","Consumer Arithmetic 3",34,38],
["Assignment 9","Wages and Salary",39,44],
["Assignment 10","Utility Bills, Commission and Exchange Rate",45,50],
["Exam 2","Exam 2",51,57],
["Assignment 12","Algebra 1",58,60],
["Assignment 13","Algebra 2",61,64],
["Assignment 14","Algebra 3",65,66],
["Assignment 15","Simultaneous Equations and Algebraic Fractions",67,70],
["Assignment 16","Solving Simultaneous Equations",71,75],
["Assignment 17","Inequalities and Proportionality",76,80],
["Assignment 18","Construction 1",81,83],
["Assignment 19","Construction 2",84,86],
["Assignment 20","Algebra Revision Questions",87,90],
["Exam 3","Exam 3",91,97],
["Assignment 22","Matrices",98,101],
["Assignment 23","Inverse Matrices",102,106],
["Assignment 24","Matrices – Simultaneous Equations and Matrix Transformation",107,112],
["Exam 4","Exam 4",113,119],
["Assignment 26","Measurements 1",120,127],
["Assignment 27","Measurements 2",128,141],
["Assignment 28","Series and Sequences",142,144],
["Exam 5","Exam 5",145,153],
["Assignment 30","Statistics 1",154,160],
["Assignment 31","Statistics 2",161,176],
["Assignment 32","Relations and Functions",177,184],
["Assignment 33","Coordinate Geometry",185,190],
["Assignment 34","Quadratics – Completing the Square",191,198],
["Assignment 35","Motion Graphs and Linear Programming",199,207],
["Exam 6","Exam 6",208,221],
["Assignment 37","Bearings",222,230],
["Assignment 38","Paper 1 Practice",231,245],
["Assignment 39","Paper 1 Practice",246,260],
["Assignment 40","Paper 1 Practice",261,275],
["Assignment 41","Circle Geometry",276,284],
["Extra Class One","Vectors Class 1 Assignment",285,291],
["Mock Exam","Paper 1",292,306],
["Mock Exam","Paper 2",307,328],
["Mock Exam","Paper 3 (estimated)",329,343],
];
const BOOK_START = topics[0][2];
const BOOK_END = topics[topics.length-1][3];
const TOTAL_PAGES = BOOK_END - BOOK_START + 1;

let pagesDoneUpTo = BOOK_START - 1;
let pagesPerDay = 7;
let startDateStr = null;
let scheduleVisible = true;

function isWeekday(d){ const w=d.getDay(); return w!==0 && w!==6; }
function fmtDate(d){ return d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}); }
function isoDate(d){ return d.toISOString().slice(0,10); }
function sameDay(a,b){ return a.toDateString()===b.toDateString(); }
function defaultStartDate(){
  let d=new Date(); d.setHours(0,0,0,0);
  while(!isWeekday(d)) d.setDate(d.getDate()+1);
  return d;
}
function buildSchedule(){
  const days=[]; let page=BOOK_START;
  let cursor = startDateStr ? new Date(startDateStr+"T00:00:00") : defaultStartDate();
  while(!isWeekday(cursor)) cursor.setDate(cursor.getDate()+1);
  while(page<=BOOK_END){
    const dayEnd=Math.min(page+pagesPerDay-1,BOOK_END);
    const covered=topics.filter(t=>t[2]<=dayEnd && t[3]>=page);
    const hasExam=covered.some(t=>t[0].startsWith("Exam")||t[1].startsWith("Paper"));
    days.push({date:new Date(cursor),startPage:page,endPage:dayEnd,topics:covered,hasExam});
    page=dayEnd+1; cursor.setDate(cursor.getDate()+1);
    while(!isWeekday(cursor)) cursor.setDate(cursor.getDate()+1);
  }
  return days;
}
function renderTopicNames(covered){
  return covered.map(t=>{
    const isExam=t[0].startsWith("Exam")||t[1].startsWith("Paper");
    const label=(t[0].startsWith("Assignment")||t[0]==="Extra Class One")?t[1]:(t[0]+(t[1]!==t[0]?" — "+t[1]:""));
    return isExam?'<span class="exam-tag">'+label+'</span>':label;
  }).join(", ");
}
function renderPlanner(){
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
      pagesDoneUpTo = done ? day.startPage-1 : day.endPage;
      saveProgress(); renderPlanner();
    });
    body.appendChild(el);
  });
  const doneCount=Math.max(0,pagesDoneUpTo-BOOK_START+1);
  document.getElementById('pagesDoneStat').textContent=doneCount;
  document.getElementById('pagesTotalStat').textContent=TOTAL_PAGES;
  document.getElementById('progressFill').style.width=Math.min(100,(doneCount/TOTAL_PAGES*100))+'%';
  const last=schedule[schedule.length-1];
  document.getElementById('finishDateStat').textContent = last?fmtDate(last.date):'—';
}
function loadState(){
  try{ const p=localStorage.getItem('pagesDoneUpTo'); if(p!==null) pagesDoneUpTo=JSON.parse(p); }catch(e){}
  try{ const pd=localStorage.getItem('pagesPerDay'); if(pd!==null) pagesPerDay=JSON.parse(pd); }catch(e){}
  try{ const sd=localStorage.getItem('startDate'); if(sd!==null) startDateStr=JSON.parse(sd); }catch(e){}
  try{ const n=localStorage.getItem('notes'); if(n!==null) document.getElementById('notes').value=JSON.parse(n); }catch(e){}
  document.getElementById('pace').value=pagesPerDay;
  document.getElementById('paceVal').textContent=pagesPerDay+' pages';
  document.getElementById('startDate').value=startDateStr||isoDate(defaultStartDate());
  renderPlanner();
}
function saveProgress(){ try{ localStorage.setItem('pagesDoneUpTo',JSON.stringify(pagesDoneUpTo)); }catch(e){} }
function savePace(){ try{ localStorage.setItem('pagesPerDay',JSON.stringify(pagesPerDay)); }catch(e){} }
function saveStartDate(){ try{ localStorage.setItem('startDate',JSON.stringify(startDateStr)); }catch(e){} }

document.getElementById('pace').addEventListener('input',(e)=>{
  pagesPerDay=parseInt(e.target.value,10);
  document.getElementById('paceVal').textContent=pagesPerDay+' pages';
  savePace(); renderPlanner();
});
document.getElementById('startDate').addEventListener('change',(e)=>{
  startDateStr=e.target.value; saveStartDate(); renderPlanner();
});
let noteTimer;
document.getElementById('notes').addEventListener('input',(e)=>{
  clearTimeout(noteTimer);
  const val=e.target.value;
  document.getElementById('saveNote').textContent='saving...';
  noteTimer=setTimeout(()=>{
    try{
      localStorage.setItem('notes',JSON.stringify(val));
      document.getElementById('saveNote').textContent='saved';
      setTimeout(()=>{document.getElementById('saveNote').textContent='';},1200);
    }catch(err){ document.getElementById('saveNote').textContent='could not save'; }
  },500);
});
document.getElementById('scheduleToggle').addEventListener('click',()=>{
  scheduleVisible=!scheduleVisible;
  document.getElementById('scheduleBody').style.display=scheduleVisible?'block':'none';
  document.getElementById('scheduleToggleLabel').textContent=scheduleVisible?'hide':'show';
});

document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('view-'+tab.dataset.view).classList.add('active');
  });
});

let gState = { xp:0, streakCount:0, lastActiveDay:null, badges:[] };
let qScores = {};
let fcReviewCount = 0;
let totalCorrect = 0;
let qAttempts = {};

const badgeDefs = [
  { id:'streak3', name:'3-Day Streak', icon:'🔥', check: s=>s.streakCount>=3 },
  { id:'streak7', name:'7-Day Streak', icon:'🌟', check: s=>s.streakCount>=7 },
  { id:'streak14', name:'14-Day Streak', icon:'💎', check: s=>s.streakCount>=14 },
  { id:'xp50', name:'50 XP', icon:'🌱', check: s=>s.xp>=50 },
  { id:'xp200', name:'200 XP', icon:'👑', check: s=>s.xp>=200 },
  { id:'xp500', name:'500 XP', icon:'🏆', check: s=>s.xp>=500 },
  { id:'correct10', name:'10 Correct', icon:'🎯', check: s=>totalCorrect>=10 },
  { id:'correct50', name:'50 Correct', icon:'🎓', check: s=>totalCorrect>=50 },
];

const mascotMessages = {
  correct: ["Yes! That's it! ✨","Nailed it! 🎉","You're on a roll! 🔥","Great work! 💝"],
  wrong: ["No worries, that one's tricky. 🌸","Good try — check the answer and move on!","That's how we learn! 🌱"],
  idle: ["Let's study today! 🌸","Ready when you are! ✨","Small steps add up! 💝"],
  streak: ["days in a row — you're building a great habit! 🔥"]
};

function gDayKey(d){
  const shifted = new Date(d.getTime() - 9*60*60*1000);
  return isoDate(shifted);
}
function gLoad(){
  try{ const raw=localStorage.getItem('gState'); if(raw) gState = Object.assign(gState, JSON.parse(raw)); }catch(e){}
  try{ const raw=localStorage.getItem('qScores'); if(raw) qScores = JSON.parse(raw); }catch(e){}
  try{ const raw=localStorage.getItem('fcReviewCount'); if(raw) fcReviewCount = JSON.parse(raw); }catch(e){}
  try{ const raw=localStorage.getItem('totalCorrect'); if(raw) totalCorrect = JSON.parse(raw); }catch(e){}
  try{ const raw=localStorage.getItem('qAttempts'); if(raw) qAttempts = JSON.parse(raw); }catch(e){}
}
function gSave(){
  try{ localStorage.setItem('gState', JSON.stringify(gState)); }catch(e){}
  try{ localStorage.setItem('qScores', JSON.stringify(qScores)); }catch(e){}
  try{ localStorage.setItem('fcReviewCount', JSON.stringify(fcReviewCount)); }catch(e){}
  try{ localStorage.setItem('totalCorrect', JSON.stringify(totalCorrect)); }catch(e){}
  try{ localStorage.setItem('qAttempts', JSON.stringify(qAttempts)); }catch(e){}
}
function gBumpStreak(){
  const today = gDayKey(new Date());
  if(gState.lastActiveDay === today) return;
  if(gState.lastActiveDay){
    const diff = Math.round((new Date(today) - new Date(gState.lastActiveDay)) / 86400000);
    gState.streakCount = (diff===1) ? gState.streakCount+1 : 1;
  } else {
    gState.streakCount = 1;
  }
  gState.lastActiveDay = today;
}
function addXP(amount){
  const prevLevel = Math.floor(gState.xp/50);
  gState.xp += amount;
  const today = gDayKey(new Date());
  qScores[today] = (qScores[today]||0) + amount;
  gBumpStreak();
  gSave();
  const newLevel = Math.floor(gState.xp/50);
  if(newLevel>prevLevel) celebrate('Level up! Now level '+(newLevel+1)+' 🌟');
  checkBadges();
  if(document.getElementById('view-progress').classList.contains('active')) renderProgressTab();
}
function checkBadges(){
  badgeDefs.forEach(b=>{
    if(!gState.badges.includes(b.id) && b.check(gState)){
      gState.badges.push(b.id);
      gSave();
      celebrate('Badge unlocked: '+b.name+' '+b.icon);
    }
  });
}
function playChime(){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    [523.25, 659.25].forEach((freq,i)=>{
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type='sine'; osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.001,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime+0.02+i*0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.35+i*0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime+i*0.12); osc.stop(ctx.currentTime+0.4+i*0.12);
    });
  }catch(e){}
}
function spawnConfetti(){
  const colors = ['#E8608E','#F4B740','#7FC7A0','#FFD9E7','#F291B0'];
  for(let i=0;i<26;i++){
    const p = document.createElement('div');
    p.className='confetti-piece';
    p.style.left = (Math.random()*100)+'vw';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDelay = (Math.random()*0.3)+'s';
    p.style.animationDuration = (1.2+Math.random()*0.8)+'s';
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 2200);
  }
}
function celebrate(message){
  playChime();
  spawnConfetti();
  const toast = document.getElementById('celebrateToast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'), 2200);
}
function updateMascot(kind){
  const bubble = document.getElementById('mascotBubble');
  const face = document.getElementById('mascotFace');
  if(!bubble || !face) return;
  if(kind==='correct'){ face.textContent='🤩'; bubble.textContent = mascotMessages.correct[Math.floor(Math.random()*mascotMessages.correct.length)]; }
  else if(kind==='wrong'){ face.textContent='🌿'; bubble.textContent = mascotMessages.wrong[Math.floor(Math.random()*mascotMessages.wrong.length)]; }
  else if(gState.streakCount>0){ face.textContent='🔥'; bubble.textContent = gState.streakCount+' '+mascotMessages.streak[0]; }
  else { face.textContent='🌸'; bubble.textContent = mascotMessages.idle[Math.floor(Math.random()*mascotMessages.idle.length)]; }
}
function renderProgressTab(){
  document.getElementById('streakNum').textContent = gState.streakCount;
  const level = Math.floor(gState.xp/50)+1;
  document.getElementById('levelNum').textContent = level;
  document.getElementById('xpLabel').textContent = gState.xp+' XP';
  const intoLevel = gState.xp % 50;
  document.getElementById('xpBarFill').style.width = (intoLevel/50*100)+'%';
  document.getElementById('xpSub').textContent = intoLevel+' / 50 to next level';
  updateMascot();

  const badgeGrid = document.getElementById('badgeGrid');
  badgeGrid.innerHTML = '';
  badgeDefs.forEach(b=>{
    const unlocked = gState.badges.includes(b.id);
    const cell = document.createElement('div');
    cell.className = 'badge-cell'+(unlocked?' unlocked':'');
    cell.innerHTML = `<div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div>`;
    badgeGrid.appendChild(cell);
  });

  let weakest = null, worstRatio = -1;
  Object.keys(qAttempts).forEach(subj=>{
    const a = qAttempts[subj];
    const total = a.right+a.wrong;
    if(total>=2){
      const ratio = a.wrong/total;
      if(ratio>worstRatio){ worstRatio=ratio; weakest=subj; }
    }
  });
  const weakPanel = document.getElementById('weakSpotPanel');
  if(weakest && worstRatio>0.3){
    weakPanel.style.display='block';
    document.getElementById('weakSpotText').textContent = `You've been missing quite a few "${weakest}" questions. Worth another pass in the Questions tab before moving on.`;
  } else {
    weakPanel.style.display='none';
  }

  gRenderChart();
}
function gRenderChart(){
  const today = new Date();
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date(today);
    d.setDate(d.getDate()-i);
    days.push(isoDate(d));
  }
  const maxVal = Math.max(2, ...days.map(k=>qScores[k]||0));
  const chart = document.getElementById('qChart');
  if(!chart) return;
  chart.innerHTML = '';
  days.forEach(key=>{
    const val = qScores[key] || 0;
    const heightPct = Math.max(3, (val/maxVal)*100);
    const d = new Date(key+"T12:00:00");
    const label = d.toLocaleDateString(undefined,{weekday:'short'});
    const col = document.createElement('div');
    col.className = 'q-chart-col';
    col.innerHTML = `
      <div class="q-chart-val">${val>0?val:''}</div>
      <div class="q-chart-bar" style="height:${heightPct}%"></div>
      <div class="q-chart-day">${label}</div>
    `;
    chart.appendChild(col);
  });
}

const studyTips = [
  { emoji:'💡', heading:'Study tip', text:"Cover the answer and say it out loud before you check — active recall beats rereading every time." },
  { emoji:'⏱️', heading:'Study tip', text:"Study in short 20–25 minute bursts with a real break in between. Your focus holds up better than one long grind." },
  { emoji:'🖊️', heading:'Study tip', text:"Re-writing a formula from memory (not copying it) is what actually moves it into long-term memory." },
  { emoji:'🌟', heading:"You've got this", text:"Mistakes now are cheaper than mistakes on exam day — every wrong answer here is one less on the real thing." },
  { emoji:'💪', heading:'Keep going', text:"Consistency beats intensity. A little bit today, a little bit tomorrow adds up faster than cramming." },
  { emoji:'🧩', heading:'Study tip', text:"Mix up topics instead of drilling one thing for an hour — it feels harder but builds stronger recall." },
  { emoji:'✨', heading:"You're doing great", text:"Showing up today, even for five minutes, is a win. That's how the streak gets built." },
  { emoji:'🧠', heading:'Study tip', text:"Explain the answer like you're teaching a friend. If you can't explain it simply, that's your next thing to review." },
  { emoji:'🍃', heading:'Study tip', text:"Sleep is when your brain actually files away what you studied. An earlier bedtime beats a late cram session." },
  { emoji:'🌸', heading:'Keep going', text:"You don't need to feel ready to start — starting is what makes you ready." }
];
function maybeShowTip(){
  fcReviewCount++;
  gSave();
  if(fcReviewCount % 5 === 0){
    const tip = studyTips[Math.floor(Math.random()*studyTips.length)];
    document.getElementById('tipEmoji').textContent = tip.emoji;
    document.getElementById('tipHeading').textContent = tip.heading;
    document.getElementById('tipText').textContent = tip.text;
    document.getElementById('tipOverlay').classList.add('show');
  }
}
document.getElementById('tipContinue').addEventListener('click',()=>{
  document.getElementById('tipOverlay').classList.remove('show');
});
