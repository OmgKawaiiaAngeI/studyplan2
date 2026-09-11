(()=>{
const $=id=>document.getElementById(id);
const OWNER='mishkadotcom';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const sb=()=>window.StudyAccounts?.supabase?.();
const me=()=>window.StudyAccounts?.current?.();
function isOwner(){return (me()?.username||'').toLowerCase()===OWNER}
function fmtDate(ts){return new Date(ts).toLocaleDateString(undefined,{month:'numeric',day:'numeric',year:'numeric'})}
function wait(fn,n=120){if(fn())return;if(n)setTimeout(()=>wait(fn,n-1),100)}
function shrink(file,max=900,q=.76){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const sc=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*sc));c.height=Math.max(1,Math.round(im.height*sc));c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',q))};im.src=r.result};r.readAsDataURL(file)})}

/* Make theme buttons reliable and apply to the full site. */
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-theme]');if(!b)return;const t=b.dataset.theme;if(!['pink','green','mono','gray'].includes(t))return;localStorage.setItem('studyThemeV6',t);document.documentElement.dataset.studyTheme=t;document.querySelectorAll('[data-theme]').forEach(x=>x.classList.toggle('active',x.dataset.theme===t));});
function applyThemeNow(){const t=localStorage.getItem('studyThemeV6')||'pink';document.documentElement.dataset.studyTheme=t;document.querySelectorAll('[data-theme]').forEach(x=>x.classList.toggle('active',x.dataset.theme===t))}
setTimeout(applyThemeNow,80);setTimeout(applyThemeNow,800);

wait(()=>{
 const side=$('appSideNav'),main=document.querySelector('.app-main-area');if(!side||!main||!window.studyAppShow||!sb()||!me())return false;
 if(!side.querySelector('[data-shellgo="blog"]')){
   const b=document.createElement('button');b.dataset.shellgo='blog';b.className='sp7-blog-link';b.textContent='Blog';b.onclick=()=>showBlog();
   const extra=$('sp6Extra');side.insertBefore(b,extra||side.querySelector('.secondary-section-label')||null);
 }
 if(!$('view-blog')){const v=document.createElement('div');v.id='view-blog';v.className='view';main.appendChild(v)}
 buildBlog();return true;
});

function showBlog(){window.studyAppShow?.('blog');renderBlog();document.querySelectorAll('#appSideNav button').forEach(b=>b.classList.toggle('active',b.dataset.shellgo==='blog'))}
/* refresh the feed when coming back to the tab, since posts can now come from other people */
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&$('view-blog')?.classList.contains('active'))renderBlog()});

function byline(p){
  p=p||{};
  const name=esc(p.display_name||p.username||'Someone'),initial=esc((p.display_name||p.username||'?')[0].toUpperCase());
  const pic=p.avatar_url?`<img class="sp7-byline-img" src="${esc(p.avatar_url)}" alt="">`:`<div class="sp7-byline-fallback">${initial}</div>`;
  const frameAttr=p.equipped_avatar_frame?` data-avatar-frame="${esc(p.equipped_avatar_frame)}"`:'';
  return `<button type="button" class="sp7-byline" data-person="${esc(p.id)}"><span class="sp7-byline-pic"${frameAttr}>${pic}</span><span class="sp7-byline-text"><b>${name}</b>${p.is_owner?'<small class="sp7-owner-badge">✿ Owner</small>':''}</span></button>`;
}
function buildBlog(){const v=$('view-blog');if(!v)return;v.innerHTML=`<div class="sp7-blog"><div class="sp7-blog-top"><div><div class="sp7-blog-kicker">Community</div><h2>Blog.</h2><div class="sp7-blog-sub">Study thoughts, tips, updates and encouragement.</div></div><button id="sp7Create" class="sp7-create" hidden>+ Create post</button></div><div id="sp7Feed" class="sp7-feed"></div></div>`;const c=$('sp7Create');if(c){c.hidden=!isOwner();c.onclick=openComposer}renderBlog()}
async function fetchPosts(){
  const {data,error}=await sb().from('blog_posts').select('id,type,title,content,link,image_url,created_at,author_id,profiles(id,username,display_name,avatar_url,is_owner,equipped_avatar_frame)').order('created_at',{ascending:false}).limit(100);
  if(error)throw error;
  return data||[];
}
async function renderBlog(){
  const feed=$('sp7Feed');if(!feed)return;
  const create=$('sp7Create');if(create)create.hidden=!isOwner();
  feed.innerHTML='<div class="sp7-empty">Loading posts…</div>';
  let posts;
  try{posts=await fetchPosts()}catch{feed.innerHTML='<div class="sp7-empty">Could not load the blog right now.</div>';return}
  feed.innerHTML=posts.length?posts.map(p=>`<article class="sp7-post">${p.image_url?`<img src="${esc(p.image_url)}" alt="Blog post image">`:''}<div class="sp7-post-body">${byline(p.profiles)}<div class="sp7-post-type">${esc(p.type||'Post')}</div>${p.title?`<h3 class="sp7-post-title">${esc(p.title)}</h3>`:''}<div class="sp7-post-text">${esc(p.content||'')}</div>${p.link?`<div class="sp7-post-meta"><a href="${esc(p.link)}" target="_blank" rel="noopener">Open link</a><span>${esc(fmtDate(p.created_at))}</span></div>`:`<div class="sp7-post-meta"><span>${esc(fmtDate(p.created_at))}</span></div>`}</div></article>`).join(''):'<div class="sp7-empty">No blog posts yet.</div>';
  feed.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{window.studyAppShow?.('profile');window.StudySocial?.renderProfile?.(b.dataset.person)});
}
function openComposer(){if(!isOwner())return;let m=$('sp7Modal');if(m)m.remove();m=document.createElement('div');m.id='sp7Modal';m.className='sp7-modal';m.innerHTML=`<div class="sp7-modal-card"><div class="sp7-modal-head"><h3>Create post</h3><button class="sp7-close" aria-label="Close">×</button></div><div class="sp7-types"><button class="active" data-posttype="Tip">Tip</button><button data-posttype="Method">Method</button><button data-posttype="Quote">Quote</button><button data-posttype="Encouragement">Encouragement</button><button data-posttype="Update">Update</button></div><input id="sp7Title" maxlength="120" placeholder="Title (optional)"><textarea id="sp7Text" maxlength="5000" placeholder="Share a study tip, update, quote, method or encouragement..."></textarea><input id="sp7Link" maxlength="600" placeholder="Link (optional)"><div class="sp7-upload-row"><label>Add image<input id="sp7Image" type="file" accept="image/*" hidden></label><img id="sp7Preview" class="sp7-preview" hidden alt="Selected image"></div><button id="sp7Submit" class="sp7-post-submit">Post</button><div id="sp7Msg" class="sp7-msg"></div></div>`;document.body.appendChild(m);let type='Tip',previewDataUrl=null;m.querySelector('.sp7-close').onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove()};m.querySelectorAll('[data-posttype]').forEach(b=>b.onclick=()=>{type=b.dataset.posttype;m.querySelectorAll('[data-posttype]').forEach(x=>x.classList.toggle('active',x===b))});$('sp7Image').onchange=async()=>{const f=$('sp7Image').files?.[0];if(!f)return;const msg=$('sp7Msg');msg.textContent='Preparing image…';try{previewDataUrl=await shrink(f);$('sp7Preview').src=previewDataUrl;$('sp7Preview').hidden=false;msg.textContent=''}catch{msg.textContent='Could not prepare that image. Try another one.'}};$('sp7Submit').onclick=async()=>{if(!isOwner()){$('sp7Msg').textContent='Only the owner account can publish.';return}const text=$('sp7Text').value.trim(),title=$('sp7Title').value.trim(),link=$('sp7Link').value.trim();if(!text&&!title&&!previewDataUrl){$('sp7Msg').textContent='Add some text, a title, or an image first.';return}if(link&& !/^https?:\/\//i.test(link)){$('sp7Msg').textContent='Links must start with http:// or https://';return}const btn=$('sp7Submit');btn.disabled=true;btn.textContent='Posting…';try{let image_url=null;if(previewDataUrl){const blob=await(await fetch(previewDataUrl)).blob();const path=`${me().id}/blog-${Date.now()}.jpg`;const up=await sb().storage.from('profile-media').upload(path,blob,{upsert:true,contentType:'image/jpeg'});if(up.error)throw up.error;image_url=sb().storage.from('profile-media').getPublicUrl(path).data.publicUrl}const{error}=await sb().from('blog_posts').insert({author_id:me().id,type,title,content:text,link:link||null,image_url});if(error)throw error;m.remove();renderBlog()}catch(err){$('sp7Msg').textContent=err?.message||'This post could not be saved. Try a smaller image.';btn.disabled=false;btn.textContent='Post'}}}
})();
