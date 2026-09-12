(()=>{
const $=id=>document.getElementById(id),sb=()=>window.StudyAccounts?.supabase?.(),me=()=>window.StudyAccounts?.current?.();
const owner=()=>String(me()?.username||'').toLowerCase()==='mishkadotcom';
function installDelete(){const feed=$('sp7Feed');if(!feed||feed.dataset.v13)return;feed.dataset.v13='1';const enhance=()=>{if(!owner())return;feed.querySelectorAll('.sp7-post').forEach((post,i)=>{if(post.querySelector('.sp13-delete'))return;const b=document.createElement('button');b.className='sp13-delete';b.type='button';b.textContent='Delete post';b.onclick=async()=>{if(!confirm('Delete this blog post?'))return;try{const {data,error}=await sb().from('blog_posts').select('id').order('created_at',{ascending:false}).limit(100);if(error)throw error;const id=data?.[i]?.id;if(!id)throw new Error('Post not found');b.disabled=true;b.textContent='Deleting…';const r=await sb().from('blog_posts').delete().eq('id',id).eq('author_id',me().id);if(r.error)throw r.error;post.remove()}catch(e){b.disabled=false;b.textContent='Delete post';alert(e?.message||'Could not delete this post.')}};post.querySelector('.sp7-post-body')?.appendChild(b)})};new MutationObserver(enhance).observe(feed,{childList:true,subtree:true});enhance()}
function install(){installDelete();setTimeout(installDelete,500)}
new MutationObserver(install).observe(document.body,{childList:true,subtree:true});setTimeout(install,800);
const st=document.createElement('style');st.textContent=`
.sp13-delete{margin-top:16px;border:1px solid var(--sp-line,#ddd);border-radius:999px;background:var(--sp-panel,#fff);color:var(--sp-muted,#777);padding:8px 13px;font-weight:800;cursor:pointer}.sp13-delete:hover{background:var(--sp-accent-soft,#f4ecef);color:var(--sp-ink,#333)}
/* Frame canvas is deliberately larger than the avatar and never clipped. */
.sp8-avatar-wrap{overflow:visible!important;isolation:isolate}.sp8-avatar-wrap:after{pointer-events:none!important;z-index:8!important;background-size:contain!important;background-repeat:no-repeat!important;background-position:center!important}
.sp8-avatar-wrap[data-avatar-frame="frame_sweet_crown"]:after{inset:-38%!important;width:176%!important;height:176%!important;transform:none!important}
.sp8-avatar-wrap[data-avatar-frame="frame_pearl_bow"]:after{inset:-30%!important;width:160%!important;height:160%!important}
.sp8-profile-body,.sp8-profile-card,#view-profile{overflow:visible!important}
@media(max-width:700px){.sp8-avatar-wrap[data-avatar-frame="frame_sweet_crown"]:after{inset:-40%!important;width:180%!important;height:180%!important}}
`;document.head.appendChild(st);
})();