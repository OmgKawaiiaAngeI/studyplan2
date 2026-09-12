(()=>{
const $=id=>document.getElementById(id);
const sb=()=>window.StudyAccounts?.supabase?.();
const me=()=>window.StudyAccounts?.current?.();
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate=ts=>{try{return new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}catch{return ''}};
function wait(fn,n=150){if(fn())return;if(n)setTimeout(()=>wait(fn,n-1),100)}

async function loadAccounts(){
  const {data,error}=await sb().from('profiles').select('id,username,display_name,avatar_url,is_owner,is_banned,created_at').order('created_at',{ascending:false});
  if(error)throw error;
  return data||[];
}
function row(p){
  const mine=p.id===me()?.id;
  const pic=p.avatar_url?`<img class="sp10-admin-avatar" src="${esc(p.avatar_url)}" alt="">`:`<div class="sp10-admin-avatar sp10-admin-fallback">${esc((p.display_name||p.username||'?')[0].toUpperCase())}</div>`;
  return `<div class="sp10-admin-row ${p.is_banned?'sp10-banned-row':''}">${pic}<div class="sp10-admin-info"><b>${esc(p.display_name||p.username)}</b><small>@${esc(p.username)}${p.is_owner?' · Owner':''}${p.is_banned?' · Banned':''}</small><small>Joined ${esc(fmtDate(p.created_at))}</small></div>${mine||p.is_owner?'<span class="sp10-admin-self">You</span>':`<div class="sp10-admin-actions"><button data-ban="${p.id}" data-state="${p.is_banned?'1':'0'}">${p.is_banned?'Unban':'Ban'}</button><button data-del="${p.id}" data-name="${esc(p.username)}" class="sp10-danger">Delete</button></div>`}</div>`;
}
async function renderList(){
  const host=$('sp10AdminList');if(!host)return;
  host.innerHTML='<div class="sp10-admin-loading">Loading accounts…</div>';
  try{
    const accounts=await loadAccounts();
    host.innerHTML=accounts.length?accounts.map(row).join(''):'<div class="sp10-admin-loading">No accounts yet.</div>';
    host.querySelectorAll('[data-ban]').forEach(b=>b.onclick=async()=>{
      b.disabled=true;const banned=b.dataset.state!=='1';
      const {error}=await sb().rpc('admin_set_banned',{target_id:b.dataset.ban,banned});
      if(error){alert(error.message);b.disabled=false;return}
      renderList();
    });
    host.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
      if(!confirm(`Permanently delete @${b.dataset.name}'s account and all their data? This cannot be undone.`))return;
      b.disabled=true;
      const {error}=await sb().rpc('admin_delete_user',{target_id:b.dataset.del});
      if(error){alert(error.message);b.disabled=false;return}
      renderList();
    });
  }catch(err){host.innerHTML=`<div class="sp10-admin-loading">Could not load accounts.</div>`}
}
function build(v){
  const block=document.createElement('div');block.id='sp10AdminBlock';block.className='sp10-admin-block';
  block.innerHTML=`<h3>⚠ Manage accounts</h3><p>Owner-only. Ban blocks sign-in immediately; delete permanently removes the account and everything tied to it.</p><div id="sp10AdminList" class="sp10-admin-list"></div>`;
  v.appendChild(block);
  renderList();
}
wait(()=>{
  const v=$('view-rewards');
  const a=me();
  if(!v||!sb()||!a)return false;
  if((a.username||'').toLowerCase()!=='mishkadotcom')return true; // not the owner: stop waiting, show nothing
  if($('sp10AdminBlock'))return true;
  build(v);
  return true;
});
const style=document.createElement('style');
style.textContent=`.sp10-admin-block{margin-top:18px;border:2px solid #e2555a;border-radius:16px;padding:16px;background:#fff3f3}.sp10-admin-block h3{color:#a3272c;margin:0 0 4px}.sp10-admin-block>p{color:#8a4448;margin:0 0 12px;font-size:13px}.sp10-admin-list{display:grid;gap:8px;max-height:420px;overflow:auto}.sp10-admin-row{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #f3c9ca;border-radius:12px;padding:9px 11px}.sp10-admin-row.sp10-banned-row{background:#ffe4e4;border-color:#e2999b}.sp10-admin-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;background:#f1dfe5;flex:none}.sp10-admin-fallback{display:grid;place-items:center;font:700 15px serif;color:#a3272c}.sp10-admin-info{display:grid;line-height:1.35;flex:1;min-width:0}.sp10-admin-info small{color:#8a5457;opacity:.8}.sp10-admin-actions{display:flex;gap:6px}.sp10-admin-actions button{border:1px solid #e2999b;background:#fff;color:#a3272c;border-radius:999px;padding:7px 12px;font-weight:700;cursor:pointer;font-size:12px}.sp10-admin-actions button.sp10-danger{background:#a3272c;color:#fff;border-color:#a3272c}.sp10-admin-self{color:#8a5457;font-size:12px;font-weight:700;padding:0 6px}.sp10-admin-loading{color:#8a5457;padding:10px;font-size:13px}`;
document.head.appendChild(style);
})();
