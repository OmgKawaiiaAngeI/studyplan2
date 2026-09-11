/* ---------------- Questions ---------------- */
const questionBank = {
  "Sets":[
    ["If A = {2, 4, 6, 8} and B = {4, 8, 12}, find A ∩ B.", "{4, 8} — the elements in both sets."],
    ["If A = {2, 4, 6, 8} and B = {4, 8, 12}, find A ∪ B.", "{2, 4, 6, 8, 12} — all elements from either set, no repeats."],
    ["If U = {1,2,3,4,5,6,7,8,9,10} and A = {1,3,5,7,9}, find A'.", "{2, 4, 6, 8, 10} — everything in U that's not in A."],
    ["If n(A)=7, n(B)=5, and n(A∩B)=3, find n(A∪B).", "n(A)+n(B)−n(A∩B) = 7+5−3 = 9."],
    ["Is 5 an element of {1, 3, 5, 7}? Write it using set notation.", "Yes: 5 ∈ {1, 3, 5, 7}."]
  ],
  "Significant Figures":[
    ["Round 6.2384 to 3 significant figures.", "6.24"],
    ["Round 0.00592 to 2 significant figures.", "0.0059"],
    ["Round 78,650 to 2 significant figures.", "79,000"],
    ["How many significant figures does 3.0500 have?", "5 — the trailing zeros count because there's a decimal point."]
  ],
  "Number Classification":[
    ["Is −7 an integer? Is it a natural number?", "Yes, it's an integer (Z). No, it's not natural (N) — natural numbers are positive counting numbers."],
    ["Is 2/3 rational or irrational?", "Rational — it's written as a fraction of two integers."],
    ["Which number sets does 0 belong to: N, W, Z, Q, R?", "W, Z, Q, and R — but NOT N (0 isn't a natural number)."],
    ["Is √16 rational? Explain.", "Yes — √16 = 4, a whole number, which can be written as a fraction (4/1), so it's rational."]
  ],
  "Fractions":[
    ["Turn 9 into a fraction with denominator 5.", "45/5 (9 × 5 = 45)."],
    ["Simplify 8/12.", "2/3 (divide both by their HCF, 4)."],
    ["Add 1/3 + 1/6.", "1/2 (2/6 + 1/6 = 3/6 = 1/2)."],
    ["Convert 5/8 to a decimal.", "0.625"]
  ],
  "Scientific Notation and Ratios":[
    ["Write 56,000 in scientific notation.", "5.6 × 10⁴"],
    ["Write 0.00073 in scientific notation.", "7.3 × 10⁻⁴"],
    ["Simplify the ratio 24:36.", "2:3 (divide both by their HCF, 12)."],
    ["Share $600 in the ratio 1:2:3.", "$100, $200, $300 (6 parts total, $100 per part)."],
    ["Write 3.2 × 10³ as an ordinary number.", "3200"]
  ]
};

const qSubjectNames = Object.keys(questionBank);
let qSubject = qSubjectNames[0];
let qIndex = 0;
let qAnswerShown = false;
let qQuickMode = false;
let qQuickQueue = [];

function qPopulateSubjects(){
  const sel = document.getElementById('qSubject');
  sel.innerHTML = '';
  qSubjectNames.forEach(name=>{
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    sel.appendChild(opt);
  });
  sel.value = qSubject;
}
function qCurrentDeck(){
  return qQuickMode ? qQuickQueue : questionBank[qSubject].map((qa,i)=>({q:qa[0],a:qa[1],subject:qSubject,idx:i}));
}
function qRenderQuestion(){
  const deck = qCurrentDeck();
  const item = deck[qIndex];
  document.getElementById('qCard').textContent = item.q;
  document.getElementById('qAnswer').textContent = item.a;
  document.getElementById('qAnswer').style.display = 'none';
  document.getElementById('qGradeRow').style.display = 'none';
  document.getElementById('qShowAnswer').style.display = 'inline-block';
  qAnswerShown = false;
  const label = qQuickMode ? 'Quick review · '+item.subject : qSubject;
  document.getElementById('qProgress').textContent = (qIndex+1)+' / '+deck.length+' · '+label;
}
function qNextQuestion(){
  const deck = qCurrentDeck();
  if(qQuickMode && qIndex>=deck.length-1){
    celebrate('Quick review complete! ⚡');
    gState.badges.includes('quickReview') || (gState.badges.push('quickReview'), gSave());
    qQuickMode = false;
    qIndex = 0;
    qRenderQuestion();
    return;
  }
  qIndex = (qIndex+1) % deck.length;
  qRenderQuestion();
}
function qRecordAttempt(subject, correct){
  if(!qAttempts[subject]) qAttempts[subject] = {right:0, wrong:0};
  qAttempts[subject][correct?'right':'wrong']++;
  gSave();
}
document.getElementById('qQuickReview').addEventListener('click',()=>{
  const pool = [];
  qSubjectNames.forEach(subj=>{
    questionBank[subj].forEach((qa,i)=>pool.push({q:qa[0],a:qa[1],subject:subj,idx:i}));
  });
  for(let i=pool.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]] = [pool[j],pool[i]];
  }
  qQuickQueue = pool.slice(0,5);
  qQuickMode = true;
  qIndex = 0;
  qRenderQuestion();
});
document.getElementById('qSubject').addEventListener('change',(e)=>{
  qQuickMode = false;
  qSubject = e.target.value; qIndex = 0; qRenderQuestion();
});
document.getElementById('qShowAnswer').addEventListener('click',()=>{
  document.getElementById('qAnswer').style.display = 'block';
  document.getElementById('qGradeRow').style.display = 'flex';
  document.getElementById('qShowAnswer').style.display = 'none';
  qAnswerShown = true;
});
document.getElementById('qRight').addEventListener('click',()=>{
  const item = qCurrentDeck()[qIndex];
  qRecordAttempt(item.subject, true);
  totalCorrect++;
  addXP(2);
  updateMascot('correct');
  qNextQuestion();
});
document.getElementById('qWrong').addEventListener('click',()=>{
  const item = qCurrentDeck()[qIndex];
  qRecordAttempt(item.subject, false);
  updateMascot('wrong');
  qNextQuestion();
});

/* ---------------- Focus timer ---------------- */
let timerSeconds = 25*60;
let timerMode = 'focus';
let timerRunning = false;
let timerInterval = null;
function timerRender(){
  const m = Math.floor(timerSeconds/60).toString().padStart(2,'0');
  const s = (timerSeconds%60).toString().padStart(2,'0');
  document.getElementById('timerDisplay').textContent = m+':'+s;
  document.getElementById('timerMode').textContent = timerMode==='focus' ? 'Focus session' : 'Break time';
}
function timerTick(){
  timerSeconds--;
  if(timerSeconds<=0){
    if(timerMode==='focus'){
      addXP(5);
      celebrate('Focus session done! +5 XP 🍅');
      timerMode='break'; timerSeconds=5*60;
    } else {
      celebrate('Break\'s over — ready for another round?');
      timerMode='focus'; timerSeconds=25*60;
    }
  }
  timerRender();
}
document.getElementById('timerToggle').addEventListener('click',()=>{
  timerRunning = !timerRunning;
  document.getElementById('timerToggle').textContent = timerRunning ? 'Pause' : 'Start';
  if(timerRunning){ timerInterval = setInterval(timerTick, 1000); }
  else { clearInterval(timerInterval); }
});
document.getElementById('timerReset').addEventListener('click',()=>{
  clearInterval(timerInterval);
  timerRunning=false;
  document.getElementById('timerToggle').textContent='Start';
  timerMode='focus'; timerSeconds=25*60;
  timerRender();
});

gLoad();
qPopulateSubjects();
qRenderQuestion();
timerRender();
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    if(tab.dataset.view==='progress') renderProgressTab();
  });
});
renderProgressTab();

/* ---------------- Cute dashboard + richer flashcards ---------------- */
if(!document.getElementById('cuteDashboardStyles')){
  const css=document.createElement('link');css.id='cuteDashboardStyles';css.rel='stylesheet';css.href='cute-dashboard.css?v=1';document.head.appendChild(css);
}
window.addEventListener('load',()=>{
  const load=(id,src)=>new Promise(resolve=>{
    if(document.getElementById(id)) return resolve();
    const s=document.createElement('script');s.id=id;s.src=src;s.onload=resolve;s.onerror=resolve;document.body.appendChild(s);
  });
  load('flashcardMoreScript','flashcard-more.js?v=1').then(()=>load('dashboardScript','dashboard.js?v=1'));
});
