(()=>{
const $=id=>document.getElementById(id);
const rewards=()=>{try{return JSON.parse(localStorage.getItem('studyRewardsV1')||'{"points":0,"rewards":[]}')}catch{return {points:0,rewards:[]}}};
const save=s=>localStorage.setItem('studyRewardsV1',JSON.stringify(s));
const xp=()=>{try{return Number(JSON.parse(localStorage.getItem('gState')||'{}').xp)||0}catch{return 0}};
function syncLocal(){const s=rewards(),x=xp();if(x>s.points){s.points=x;save(s)}return Math.max(x,Number(s.points)||0)}
async function syncCloud(points){try{const sb=window.StudyAccounts?.supabase?.(),me=window.StudyAccounts?.current?.();if(!sb||!me)return;const {data}=await sb.from('profiles').select('points').eq('id',me.id).single();const cloud=Number(data?.points)||0;if(points>cloud)await sb.from('profiles').update({points}).eq('id',me.id)}catch{}}
function draw(){const p=syncLocal();document.querySelectorAll('[data-personal-points]').forEach(e=>e.textContent=p);if($('dashRewardPoints'))$('dashRewardPoints').textContent=p;if($('rewardBalance'))$('rewardBalance').textContent=p;syncCloud(p)}
function hookXP(){if(typeof window.addXP!=='function'||window.addXP._pointSync)return false;const old=window.addXP;window.addXP=function(n){const r=old(n);const s=rewards();s.points=Math.max(Number(s.points)||0,xp());save(s);draw();return r};window.addXP._pointSync=true;return true}
function addHomePoints(){const dash=$('view-dashboard');if(!dash||$('personalPointsHome'))return false;const hero=dash.querySelector('.dash-hero')||dash;const el=document.createElement('div');el.id='personalPointsHome';el.className='panel';el.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:16px"><div><small>My XP</small><h2 style="margin:.2rem 0"><span data-personal-points>0</span> points</h2></div><div style="min-width:150px;flex:1;max-width:320px"><div class="reward-bar"><i id="personalXpBar"></i></div></div></div>';hero.insertAdjacentElement('afterend',el);return true}
function bar(){const p=syncLocal(),fill=$('personalXpBar');if(fill)fill.style.width=Math.min(100,(p%50)/50*100)+'%'}
let n=100;(function wait(){hookXP();addHomePoints();draw();bar();if(n-->0)setTimeout(wait,150)})();
window.addEventListener('storage',()=>{draw();bar()});
})();