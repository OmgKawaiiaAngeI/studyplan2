(()=>{
const M='mistakeBookV2';
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}};
const mistakes=()=>read(M,[]);
function xp(){const g=read('gState',{}),r=read('studyRewardsV1',{});return Math.max(Number(g.xp)||0,Number(r.points)||0)}
function renderAll(){
 const list=mistakes(),active=list.filter(x=>!x.mastered).length,total=list.length,p=xp();
 document.querySelectorAll('#mistakeCount,[data-mistake-count],.mistake-count-value').forEach(e=>e.textContent=total);
 document.querySelectorAll('[data-mistakes-active]').forEach(e=>e.textContent=active);
 document.querySelectorAll('[data-personal-points],#dashRewardPoints,#rewardBalance').forEach(e=>e.textContent=p);
 const label=document.getElementById('xpLabel');if(label)label.textContent=p+' XP';
 const sub=document.getElementById('xpSub');if(sub)sub.textContent=(p%50)+' / 50 to next level';
 const fill=document.getElementById('xpBarFill');if(fill)fill.style.width=((p%50)/50*100)+'%';
 document.querySelectorAll('.sp8-stats').forEach(stats=>{const first=stats.querySelector('div');if(first&&/XP/i.test(first.textContent)&&stats.closest('#view-profile')?.querySelector('.sp8-profile-actions #sp8Edit'))first.innerHTML='<b>'+p+'</b> XP'});
}
const oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){oldSet.call(this,k,v);if(k===M||k==='gState'||k==='studyRewardsV1')setTimeout(renderAll,0)};
window.addEventListener('storage',renderAll);new MutationObserver(renderAll).observe(document.documentElement,{childList:true,subtree:true});setInterval(renderAll,1200);renderAll();
})();