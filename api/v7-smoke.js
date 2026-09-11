export default async function handler(req,res){
 try{
  const base='https://raw.githubusercontent.com/OmgKawaiiaAngeI/studyplan2/account-save-themes-v6';
  const paths=['/blog-v7.js','/blog-v7.css','/study-v6.js','/index.html'];const texts={},out=[];
  for(const p of paths){const r=await fetch(base+p+'?v='+Date.now());const t=await r.text();texts[p]=t;let syntax=true,error=null;if(p.endsWith('.js')){try{new Function(t)}catch(e){syntax=false;error=String(e.message||e)}}out.push({p,status:r.status,bytes:t.length,syntax,error})}
  const js=texts['/blog-v7.js']||'',css=texts['/blog-v7.css']||'',idx=texts['/index.html']||'';
  const checks={
   all200:out.every(x=>x.status===200),syntax:out.filter(x=>x.p.endsWith('.js')).every(x=>x.syntax),loaded:idx.includes('blog-v7.css')&&idx.includes('blog-v7.js'),
   workflowButton:css.includes('#wfTaskAdd')&&css.includes('grid-template-columns:minmax(0,1.2fr)'),extraContrast:css.includes('.sp6-extra[open]')&&css.includes('.sp6-extra-menu button'),
   fullThemes:['green','mono','gray'].every(t=>css.includes(`data-study-theme=\"${t}\"`))&&css.includes('.app-main-area')&&css.includes('.wf-book'),
   blog:js.includes("data-shellgo='blog'")||js.includes('data-shellgo=\"blog\"')||js.includes("dataset.shellgo='blog'"),ownerOnly:js.includes("OWNER='mishkadotcom'")&&js.includes('if(!isOwner())return'),
   sharedKey:js.includes("BLOG_KEY='sp7:blogPosts'")&&js.includes('StudyAccounts?.rawGet')&&js.includes('StudyAccounts?.rawSet'),composer:js.includes('Create post')&&js.includes('data-posttype'),images:js.includes('shrink(file')||js.includes('shrink(f)')
  };
  res.status(200).json({ok:Object.values(checks).every(Boolean),checks,out});
 }catch(e){res.status(500).json({ok:false,error:String(e.stack||e)})}
}