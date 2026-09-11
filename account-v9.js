(()=>{
  const SUPA_URL='https://xgxheavzlzfiszftachp.supabase.co';
  const SUPA_KEY='sb_publishable_D_tfgbUJAa-Ht_DLRdIKdg_nAWbPyo3';
  const SYS_PREFIX='sp6:', SESSION_CACHE='sp9:account';
  const native={get:Storage.prototype.getItem,set:Storage.prototype.setItem,remove:Storage.prototype.removeItem,clear:Storage.prototype.clear,key:Storage.prototype.key};
  const rawGet=k=>native.get.call(localStorage,k), rawSet=(k,v)=>native.set.call(localStorage,k,v), rawRemove=k=>native.remove.call(localStorage,k);
  let cached=null; try{cached=JSON.parse(rawGet(SESSION_CACHE)||'null')}catch{}
  let activeId=cached?.id||'';
  const prefix=()=>activeId?`sp6:u:${activeId}:`:'sp6:locked:';
  const shouldScope=k=>typeof k==='string'&&!k.startsWith(SYS_PREFIX)&&!k.startsWith('sb-')&&!k.startsWith('sp9:');
  Storage.prototype.getItem=function(k){if(this===localStorage&&shouldScope(k))return native.get.call(this,prefix()+k);return native.get.call(this,k)};
  Storage.prototype.setItem=function(k,v){if(this===localStorage&&shouldScope(k))return native.set.call(this,prefix()+k,v);return native.set.call(this,k,v)};
  Storage.prototype.removeItem=function(k){if(this===localStorage&&shouldScope(k))return native.remove.call(this,prefix()+k);return native.remove.call(this,k)};
  Storage.prototype.clear=function(){if(this!==localStorage)return native.clear.call(this);const p=prefix(),ks=[];for(let i=0;i<this.length;i++){const k=native.key.call(this,i);if(k?.startsWith(p))ks.push(k)}ks.forEach(rawRemove)};
  const client=()=>window.supabase?.createClient(SUPA_URL,SUPA_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  let sb=null;
  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function setAccount(profile){cached={id:profile.id,username:profile.username,email:profile.email||''};activeId=profile.id;rawSet(SESSION_CACHE,JSON.stringify(cached));}
  function migrateKeys(fromPrefix,newId){
    const to=`sp6:u:${newId}:`,ks=[];
    for(let i=0;i<localStorage.length;i++){const k=native.key.call(localStorage,i);if(k?.startsWith(fromPrefix))ks.push(k)}
    for(const k of ks){const dest=to+k.slice(fromPrefix.length);if(rawGet(dest)===null){const v=rawGet(k);if(v!==null)rawSet(dest,v)}}
  }
  function migrateOldData(newId,username){
    // carry over data from a previous local-only account with the same username, if any existed
    let oldId='';try{oldId=native.get.call(sessionStorage,'sp6:session')||''}catch{}
    if(!oldId){try{const arr=JSON.parse(rawGet('sp6:accounts')||'[]');oldId=arr.find(a=>String(a.username).toLowerCase()===String(username).toLowerCase())?.id||''}catch{}}
    if(oldId&&oldId!==newId)migrateKeys(`sp6:u:${oldId}:`,newId);
    // carry over any study progress made on this browser before signing in at all
    migrateKeys('sp6:locked:',newId);
  }
  const EMAIL_DOMAIN='studyplan2.local';
  const emailFor=username=>`${username}@${EMAIL_DOMAIN}`;
  async function loadProfile(user){
    const {data,error}=await sb.from('profiles').select('id,username,display_name,bio,avatar_url,banner_url,points,is_owner,equipped_avatar_frame,equipped_profile_border').eq('id',user.id).single();
    if(error)throw error;return {...data,email:user.email||''};
  }
  function gate(){
    if(document.getElementById('sp9AccountGate'))return;
    const g=document.createElement('div');g.id='sp9AccountGate';g.innerHTML=`<div class="sp6-account-card"><div class="sp6-account-kicker">Study Planner</div><h1>Welcome to your study space</h1><p>Your account now works across devices. Create an account or sign in below.</p><form id="sp9Form"><label>Username<input id="sp9Username" maxlength="24" autocomplete="username" required></label><label>Password<input id="sp9Password" type="password" minlength="6" maxlength="128" autocomplete="current-password" required></label><button type="submit">Sign in</button></form><button id="sp9Mode" class="sp6-link-btn" type="button">Create an account</button><div id="sp9Msg" class="sp6-account-msg"></div><small>Your private study data stays separated by account. Profiles and social features are stored securely in Supabase.</small></div>`;
    document.body.appendChild(g);let mode='login';const form=g.querySelector('#sp9Form'),btn=form.querySelector('button'),toggle=g.querySelector('#sp9Mode'),msg=g.querySelector('#sp9Msg');
    const draw=()=>{const create=mode==='create';btn.textContent=create?'Create account':'Sign in';toggle.textContent=create?'I already have an account':'Create an account';msg.textContent=''};draw();
    toggle.onclick=()=>{mode=mode==='login'?'create':'login';draw()};
    form.onsubmit=async e=>{e.preventDefault();msg.textContent='Checking…';btn.disabled=true;try{
      const username=g.querySelector('#sp9Username').value.trim().toLowerCase(),password=g.querySelector('#sp9Password').value,email=emailFor(username);
      if(mode==='create'){
        if(!/^[a-z0-9_]{3,24}$/.test(username))throw new Error('Username must be 3–24 letters, numbers, or underscores.');
        const {data,error}=await sb.auth.signUp({email,password,options:{data:{username}}});if(error)throw error;
        if(data.user&&Array.isArray(data.user.identities)&&data.user.identities.length===0)throw new Error('That username is already taken.');
        let session=data.session,user=data.user;
        if(!session){const r=await sb.auth.signInWithPassword({email,password});if(r.error)throw r.error;session=r.data.session;user=r.data.user}
        const p=await loadProfile(user);migrateOldData(p.id,p.username);setAccount(p);location.reload();
      }else{
        const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw new Error(/invalid/i.test(error.message)?'Wrong username or password.':error.message);
        const p=await loadProfile(data.user);migrateOldData(p.id,p.username);setAccount(p);location.reload();
      }
    }catch(err){msg.textContent=err?.message||'Could not sign in.'}finally{btn.disabled=false}};
  }
  async function logout(){try{await sb?.auth.signOut()}catch{}rawRemove(SESSION_CACHE);activeId='';location.reload()}
  function badge(){const wait=()=>{const side=document.getElementById('appSideNav');if(!side){setTimeout(wait,100);return}if(document.getElementById('sp6AccountBox'))return;const b=document.createElement('div');b.id='sp6AccountBox';b.className='sp6-account-box';b.innerHTML=`<span>Signed in as</span><strong>${safe(cached?.username||'Account')}</strong><button type="button">Log out</button>`;b.querySelector('button').onclick=logout;side.appendChild(b)};wait()}
  async function init(){sb=client();if(!sb){gate();return}try{const {data}=await sb.auth.getSession();if(data.session?.user){const p=await loadProfile(data.session.user);setAccount(p);badge();return}}catch{}if(cached){rawRemove(SESSION_CACHE);activeId='';location.reload();return}gate()}
  window.StudyAccounts={isSignedIn:()=>!!activeId,current:()=>cached?{...cached}:null,logout,rawGet,rawSet,rawRemove,list:()=>cached?[cached]:[],prefix:()=>prefix(),supabase:()=>sb,refreshProfile:async()=>{if(!sb)return null;const {data}=await sb.auth.getUser();if(!data.user)return null;const p=await loadProfile(data.user);setAccount(p);return p}};
  document.addEventListener('DOMContentLoaded',init);
})();