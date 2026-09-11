(()=>{
  const SYS_PREFIX='sp6:';
  const ACCOUNTS_KEY='sp6:accounts';
  const MIGRATED_KEY='sp6:migrated';
  const SESSION_KEY='sp6:session';
  const native={
    get:Storage.prototype.getItem,
    set:Storage.prototype.setItem,
    remove:Storage.prototype.removeItem,
    clear:Storage.prototype.clear,
    key:Storage.prototype.key
  };
  const rawGet=(k)=>native.get.call(localStorage,k);
  const rawSet=(k,v)=>native.set.call(localStorage,k,v);
  const rawRemove=(k)=>native.remove.call(localStorage,k);
  const getSession=()=>{try{return native.get.call(sessionStorage,SESSION_KEY)||''}catch{return ''}};
  let activeId=getSession();
  const prefix=()=>activeId?`sp6:u:${activeId}:`:'sp6:locked:';
  const shouldScope=(k)=>typeof k==='string'&&!k.startsWith(SYS_PREFIX);

  Storage.prototype.getItem=function(k){
    if(this===localStorage&&shouldScope(k))return native.get.call(this,prefix()+k);
    return native.get.call(this,k);
  };
  Storage.prototype.setItem=function(k,v){
    if(this===localStorage&&shouldScope(k))return native.set.call(this,prefix()+k,v);
    return native.set.call(this,k,v);
  };
  Storage.prototype.removeItem=function(k){
    if(this===localStorage&&shouldScope(k))return native.remove.call(this,prefix()+k);
    return native.remove.call(this,k);
  };
  Storage.prototype.clear=function(){
    if(this!==localStorage)return native.clear.call(this);
    const p=prefix(),keys=[];
    for(let i=0;i<this.length;i++){const k=native.key.call(this,i);if(k?.startsWith(p))keys.push(k)}
    keys.forEach(k=>native.remove.call(this,k));
  };

  const loadAccounts=()=>{try{return JSON.parse(rawGet(ACCOUNTS_KEY)||'[]')}catch{return []}};
  const saveAccounts=a=>rawSet(ACCOUNTS_KEY,JSON.stringify(a));
  const bytesToB64=bytes=>btoa(String.fromCharCode(...bytes));
  const b64ToBytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  async function derive(password,salt){
    const enc=new TextEncoder();
    const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:180000,hash:'SHA-256'},key,256);
    return bytesToB64(new Uint8Array(bits));
  }
  function cleanLocked(){
    const keys=[];for(let i=0;i<localStorage.length;i++){const k=native.key.call(localStorage,i);if(k?.startsWith('sp6:locked:'))keys.push(k)}
    keys.forEach(rawRemove);
  }
  function migrateLegacy(id){
    if(rawGet(MIGRATED_KEY))return {moved:0,failed:0,done:true};
    const keys=[];
    for(let i=0;i<localStorage.length;i++){
      const k=native.key.call(localStorage,i);
      if(k&&!k.startsWith(SYS_PREFIX))keys.push(k);
    }
    let moved=0,failed=0;
    for(const k of keys){
      const v=rawGet(k);if(v===null)continue;
      const target=`sp6:u:${id}:${k}`;
      try{
        rawSet(target,v);
        if(rawGet(target)===v){rawRemove(k);moved++}else failed++;
      }catch{failed++}
    }
    if(failed===0)rawSet(MIGRATED_KEY,JSON.stringify({to:id,at:Date.now(),count:moved}));
    else rawSet('sp6:migrationPending',JSON.stringify({to:id,at:Date.now(),moved,failed}));
    return {moved,failed,done:failed===0};
  }
  function retryPendingMigration(id){
    if(rawGet(MIGRATED_KEY))return {done:true};
    return migrateLegacy(id);
  }
  function startSession(id){
    activeId=id;
    native.set.call(sessionStorage,SESSION_KEY,id);
    cleanLocked();
  }
  function logout(){
    try{native.remove.call(sessionStorage,SESSION_KEY)}catch{}
    activeId='';location.reload();
  }
  function currentAccount(){return loadAccounts().find(a=>a.id===activeId)||null}

  function overlay(){
    if(document.getElementById('sp6AccountGate'))return;
    const accounts=loadAccounts();
    const gate=document.createElement('div');gate.id='sp6AccountGate';gate.innerHTML=`
      <div class="sp6-account-card">
        <div class="sp6-account-kicker">Study Planner</div>
        <h1>${accounts.length?'Welcome back':'Protect your study data'}</h1>
        <p>${accounts.length?'Sign in to open your private study space.':'Create your first account. Your current study data will be moved into it so it stays separate from other accounts on this device.'}</p>
        <form id="sp6AccountForm">
          <label>Account name<input id="sp6Username" autocomplete="username" maxlength="40" required></label>
          <label>Password<input id="sp6Password" type="password" autocomplete="current-password" minlength="4" required></label>
          <button type="submit">${accounts.length?'Sign in':'Create account & keep my data'}</button>
        </form>
        <button id="sp6ToggleMode" class="sp6-link-btn" type="button">${accounts.length?'Create another account':'I already have an account'}</button>
        <div id="sp6AccountMsg" class="sp6-account-msg"></div>
        <small>Accounts are separated on this device. Closing the browser does not delete saved study data. Clearing this browser's site data will remove local accounts, so Settings also includes a backup option.</small>
      </div>`;
    document.body.appendChild(gate);
    let mode=accounts.length?'login':'create';
    const form=document.getElementById('sp6AccountForm'),toggle=document.getElementById('sp6ToggleMode'),msg=document.getElementById('sp6AccountMsg');
    const refresh=()=>{form.querySelector('button').textContent=mode==='login'?'Sign in':'Create account & keep my data';toggle.textContent=mode==='login'?'Create another account':'I already have an account';msg.textContent=''};
    toggle.onclick=()=>{mode=mode==='login'?'create':'login';refresh()};
    form.onsubmit=async e=>{
      e.preventDefault();msg.textContent='Checking…';
      const username=document.getElementById('sp6Username').value.trim();
      const password=document.getElementById('sp6Password').value;
      if(!username||password.length<4){msg.textContent='Use an account name and a password with at least 4 characters.';return}
      const all=loadAccounts();
      try{
        if(mode==='create'){
          if(all.some(a=>a.username.toLowerCase()===username.toLowerCase())){msg.textContent='That account name already exists.';return}
          const salt=crypto.getRandomValues(new Uint8Array(16));
          const hash=await derive(password,salt);
          const id=crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
          all.push({id,username,salt:bytesToB64(salt),hash,created:Date.now()});saveAccounts(all);
          const migration=migrateLegacy(id);
          if(!migration.done)msg.textContent='Your account was created. Some older data could not be moved yet, so it was left untouched and will be retried on sign-in.';
          startSession(id);location.reload();
        }else{
          const a=all.find(x=>x.username.toLowerCase()===username.toLowerCase());
          if(!a){msg.textContent='Account not found.';return}
          const hash=await derive(password,b64ToBytes(a.salt));
          if(hash!==a.hash){msg.textContent='Incorrect password.';return}
          retryPendingMigration(a.id);
          startSession(a.id);location.reload();
        }
      }catch(err){msg.textContent='Your data was not deleted. Something interrupted sign-in; please try again.';}
    };
  }

  function ensureAccountBadge(){
    const a=currentAccount();if(!a)return;
    const wait=()=>{
      const side=document.getElementById('appSideNav');
      if(!side){setTimeout(wait,120);return}
      if(document.getElementById('sp6AccountBox'))return;
      const box=document.createElement('div');box.id='sp6AccountBox';box.className='sp6-account-box';
      box.innerHTML=`<span>Signed in as</span><strong>${String(a.username).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]))}</strong><button type="button">Log out</button>`;
      box.querySelector('button').onclick=logout;side.appendChild(box);
    };wait();
  }

  window.StudyAccounts={
    isSignedIn:()=>!!activeId,
    current:currentAccount,
    logout,
    rawGet,rawSet,rawRemove,
    list:loadAccounts,
    prefix:()=>prefix(),
    retryMigration:()=>activeId?retryPendingMigration(activeId):{done:false}
  };
  document.addEventListener('DOMContentLoaded',()=>{if(!activeId)overlay();else ensureAccountBadge()});
})();