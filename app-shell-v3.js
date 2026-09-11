(() => {
  const $=id=>document.getElementById(id);
  const waitFor=(fn,tries=40)=>{if(fn())return; if(tries>0)setTimeout(()=>waitFor(fn,tries-1),100)};
  waitFor(()=>{
    const wrap=document.querySelector('.wrap'); if(!wrap||!$('view-dashboard')||!$('view-learn')||!$('view-test')) return false;
    if($('view-study')) return true;
    const oldViews=[...wrap.querySelectorAll(':scope > .view')];
    const shell=document.createElement('div'); shell.className='app-shell-v3';
    const side=document.createElement('aside'); side.className='app-side'; side.id='appSideNav';
    side.innerHTML=`<div class="app-side-title">Study Planner</div><button data-shellgo="dashboard">Home</button><div class="secondary-section-label">Plan</div><button data-shellgo="planner">Study Plan</button><button data-shellgo="workflow">Workflow</button><button data-shellgo="focus">Focus</button><button data-shellgo="mynotes">Notes</button><div class="secondary-section-label">Study</div><button data-shellgo="checkins">My Work</button><button data-shellgo="progress">Progress</button><button data-shellgo="mistakes">Mistake Book</button><button data-shellgo="tutor">AI Study Team</button><div class="secondary-section-label">Settings</div><button data-shellgo="rewards">Settings & Rewards</button>`;
    const main=document.createElement('div'); main.className='app-main-area';
    const menu=document.createElement('button');menu.className='app-menu-btn';menu.id='appMenuBtn';menu.textContent='☰ Menu';main.appendChild(menu);
    oldViews.forEach(v=>main.appendChild(v)); shell.append(side,main); wrap.appendChild(shell);
    const study=document.createElement('div');study.className='view';study.id='view-study';study.innerHTML=`<div class="panel"><h2>Study</h2><p>Choose the kind of study session you need right now.</p><div class="study-selector-row"><label for="studyModeSelect"><b>Study mode</b></label><select id="studyModeSelect"><option value="questions">Practice Questions</option><option value="learn">Learn Mode</option><option value="test">Test Mode</option></select><button class="fc-btn" id="openStudyMode">Open mode</button></div><div class="study-mode-grid"><button class="study-mode-card" data-modego="questions"><h3>Practice Questions</h3><p>Use this when you want a quick check of what you know. Wrong answers still go to your Mistake Book, and explanations appear after the answer.</p></button><button class="study-mode-card" data-modego="learn"><h3>Learn Mode</h3><p>Use this when you are still learning a topic and want repeated practice that gradually requires more recall.</p></button><button class="study-mode-card" data-modego="test"><h3>Test Mode</h3><p>Use this when you think you know the topic and want to test yourself with a score and optional timer.</p></button></div></div>`;
    main.insertBefore(study,main.children[1]||null);
    function show(name){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));side.querySelectorAll('button[data-shellgo]').forEach(b=>b.classList.toggle('active',b.dataset.shellgo===name));if(name==='progress'&&typeof renderProgressTab==='function')renderProgressTab();side.classList.remove('open')}
    window.studyAppShow=show;side.querySelectorAll('[data-shellgo]').forEach(b=>b.onclick=()=>show(b.dataset.shellgo));menu.onclick=()=>side.classList.toggle('open');document.addEventListener('click',e=>{if(innerWidth<=900&&side.classList.contains('open')&&!side.contains(e.target)&&e.target!==menu)side.classList.remove('open')});study.querySelectorAll('[data-modego]').forEach(b=>b.onclick=()=>show(b.dataset.modego));$('openStudyMode').onclick=()=>show($('studyModeSelect').value);
    const dash=$('view-dashboard'); if(dash&&!$('studyHomeActions')){const actions=document.createElement('div');actions.id='studyHomeActions';actions.className='study-home-actions';actions.innerHTML=`<button class="study-home-action" data-homego="study"><b>Study</b><small>Practice, Learn, or Test</small></button><button class="study-home-action" data-homego="flashcards"><b>Flashcards</b><small>Review and memorize cards</small></button><button class="study-home-action" data-homego="flashcards"><b>Daily Review</b><small>Review cards that are due</small></button><button class="study-home-action" data-homego="focus"><b>Focus</b><small>Grow a plant while you study</small></button>`;const hero=dash.querySelector('.dash-hero');hero?.insertAdjacentElement('afterend',actions);actions.querySelectorAll('[data-homego]').forEach(b=>b.onclick=()=>show(b.dataset.homego));const quick=dash.querySelector('.dash-main .panel .dash-actions');if(quick)quick.style.display='none'}
    new MutationObserver(muts=>muts.forEach(m=>[...m.addedNodes].forEach(n=>{if(n.nodeType===1&&n.classList?.contains('view')&&n.parentElement===wrap)main.appendChild(n)}))).observe(wrap,{childList:true});
    show('dashboard');return true;
  });
  const loadAsset=(id,tag,attrs)=>{if(document.getElementById(id))return;const el=document.createElement(tag);el.id=id;Object.assign(el,attrs);(tag==='link'?document.head:document.body).appendChild(el)};
  loadAsset('plannerV3Styles','link',{rel:'stylesheet',href:'planner-v3.css?v=1'});loadAsset('plannerV3Script','script',{src:'planner-v3.js?v=1'});
  loadAsset('focusGardenStyles','link',{rel:'stylesheet',href:'focus-garden.css?v=1'});loadAsset('focusGardenScript','script',{src:'focus-garden.js?v=1'});
  loadAsset('mistakeSyncV3Script','script',{src:'mistake-sync-v3.js?v=1'});
  loadAsset('asterlysHomeStyles','link',{rel:'stylesheet',href:'asterlys-home-v4.css?v=1'});
  loadAsset('asterlysHomeScript','script',{src:'asterlys-home-v4.js?v=1'});
  loadAsset('assistantNotesV4','script',{src:'assistant-notes-v4.js?v=1'});
  loadAsset('workflowNotebookV5Styles','link',{rel:'stylesheet',href:'workflow-notebook-v5.css?v=1'});
  loadAsset('workflowNotebookV5Script','script',{src:'workflow-notebook-v5.js?v=1'});
})();