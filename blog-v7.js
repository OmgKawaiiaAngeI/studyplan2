(()=>{
const $=id=>document.getElementById(id);
const OWNER='mishkadotcom';
const BLOG_KEY='sp7:blogPosts';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
function rawRead(){try{return JSON.parse(window.StudyAccounts?.rawGet?.(BLOG_KEY)||'[]')||[]}catch{return []}}
function rawWrite(v){try{window.StudyAccounts?.rawSet?.(BLOG_KEY,JSON.stringify(v));return true}catch{return false}}
function isOwner(){return (window.StudyAccounts?.current?.()?.username||'').toLowerCase()===OWNER}
function fmtDate(ts){return new Date(ts).toLocaleDateString(undefined,{month:'numeric',day:'numeric',year:'numeric'})}
function wait(fn,n=120){if(fn())return;if(n)setTimeout(()=>wait(fn,n-1),100)}
function shrink(file,max=900,q=.76){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const sc=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*sc));c.height=Math.max(1,Math.round(im.height*sc));c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',q))};im.src=r.result};r.readAsDataURL(file)})}

/* Make theme buttons reliable and apply to the full site. */
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-theme]');if(!b)return;const t=b.dataset.theme;if(!['pink','green','mono','gray'].includes(t))return;localStorage.setItem('studyThemeV6',t);document.documentElement.dataset.studyTheme=t;document.querySelectorAll('[data-theme]').forEach(x=>x.classList.toggle('active',x.dataset.theme===t));});
function applyThemeNow(){const t=localStorage.getItem('studyThemeV6')||'pink';document.documentElement.dataset.studyTheme=t;document.querySelectorAll('[data-theme]').forEach(x=>x.classList.toggle('active',x.dataset.theme===t))}
setTimeout(applyThemeNow,80);setTimeout(applyThemeNow,800);

wait(()=>{
 const side=$('appSideNav'),main=document.querySelector('.app-main-area');if(!side||!main||!window.studyAppShow)return false;
 if(!side.querySelector('[data-shellgo="blog"]')){
   const b=document.createElement('button');b.dataset.shellgo='blog';b.className='sp7-blog-link';b.textContent='Blog';b.onclick=()=>showBlog();
   const extra=$('sp6Extra');side.insertBefore(b,extra||side.querySelector('.secondary-section-label')||null);
 }
 if(!$('view-blog')){const v=document.createElement('div');v.id='view-blog';v.className='view';main.appendChild(v)}
 buildBlog();return true;
});

function showBlog(){window.studyAppShow?.('blog');renderBlog();document.querySelectorAll('#appSideNav button').forEach(b=>b.classList.toggle('active',b.dataset.shellgo==='blog'))}
function buildBlog(){const v=$('view-blog');if(!v)return;v.innerHTML=`<div class="sp7-blog"><div class="sp7-blog-top"><div><div class="sp7-blog-kicker">Community</div><h2>Blog.</h2><div class="sp7-blog-sub">Study thoughts, tips, updates and encouragement.</div></div><button id="sp7Create" class="sp7-create" hidden>+ Create post</button></div><div id="sp7Feed" class="sp7-feed"></div></div>`;const c=$('sp7Create');if(c){c.hidden=!isOwner();c.onclick=openComposer}renderBlog()}
function renderBlog(){const feed=$('sp7Feed');if(!feed)return;const posts=rawRead().slice().sort((a,b)=>(b.created||0)-(a.created||0));const create=$('sp7Create');if(create)create.hidden=!isOwner();feed.innerHTML=posts.length?posts.map(p=>`<article class="sp7-post">${p.image?`<img src="${p.image}" alt="Blog post image">`:''}<div class="sp7-post-body"><div class="sp7-post-type">${esc(p.type||'Post')}</div>${p.title?`<h3 class="sp7-post-title">${esc(p.title)}</h3>`:''}<div class="sp7-post-text">${esc(p.text||'')}</div>${p.link?`<div class="sp7-post-meta"><a href="${esc(p.link)}" target="_blank" rel="noopener">Open link</a><span>${esc(fmtDate(p.created))}</span></div>`:`<div class="sp7-post-meta"><span>${esc(p.author||OWNER)}</span><span>${esc(fmtDate(p.created))}</span></div>`}</div></article>`).join(''):'<div class="sp7-empty">No blog posts yet.</div>'}
function openComposer(){if(!isOwner())return;let m=$('sp7Modal');if(m)m.remove();m=document.createElement('div');m.id='sp7Modal';m.className='sp7-modal';m.innerHTML=`<div class="sp7-modal-card"><div class="sp7-modal-head"><h3>Create post</h3><button class="sp7-close" aria-label="Close">×</button></div><div class="sp7-types"><button class="active" data-posttype="Tip">Tip</button><button data-posttype="Method">Method</button><button data-posttype="Quote">Quote</button><button data-posttype="Encouragement">Encouragement</button><button data-posttype="Update">Update</button></div><input id="sp7Title" maxlength="120" placeholder="Title (optional)"><textarea id="sp7Text" maxlength="5000" placeholder="Share a study tip, update, quote, method or encouragement..."></textarea><input id="sp7Link" maxlength="600" placeholder="Link (optional)"><div class="sp7-upload-row"><label>Add image<input id="sp7Image" type="file" accept="image/*" hidden></label><img id="sp7Preview" class="sp7-preview" hidden alt="Selected image"></div><button id="sp7Submit" class="sp7-post-submit">Post</button><div id="sp7Msg" class="sp7-msg"></div></div>`;document.body.appendChild(m);let type='Tip',image='';m.querySelector('.sp7-close').onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove()};m.querySelectorAll('[data-posttype]').forEach(b=>b.onclick=()=>{type=b.dataset.posttype;m.querySelectorAll('[data-posttype]').forEach(x=>x.classList.toggle('active',x===b))});$('sp7Image').onchange=async()=>{const f=$('sp7Image').files?.[0];if(!f)return;const msg=$('sp7Msg');msg.textContent='Preparing image…';try{image=await shrink(f);$('sp7Preview').src=image;$('sp7Preview').hidden=false;msg.textContent=''}catch{msg.textContent='Could not prepare that image. Try another one.'}};$('sp7Submit').onclick=()=>{if(!isOwner()){$('sp7Msg').textContent='Only the owner account can publish.';return}const text=$('sp7Text').value.trim(),title=$('sp7Title').value.trim(),link=$('sp7Link').value.trim();if(!text&&!title&&!image){$('sp7Msg').textContent='Add some text, a title, or an image first.';return}if(link&& !/^https?:\/\//i.test(link)){$('sp7Msg').textContent='Links must start with http:// or https://';return}const posts=rawRead();posts.push({id:uid(),type,title,text,link,image,author:OWNER,created:Date.now()});if(!rawWrite(posts.slice(-100))){$('sp7Msg').textContent='This post could not be saved. Try a smaller image.';return}m.remove();renderBlog()}}

/* if another tab updates the shared blog, redraw */
window.addEventListener('storage',e=>{if(e.key===BLOG_KEY||e.key?.endsWith?.(':'+BLOG_KEY))renderBlog();applyThemeNow()});
})();