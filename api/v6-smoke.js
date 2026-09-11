export default async function handler(req,res){
 try{
  const base='https://raw.githubusercontent.com/OmgKawaiiaAngeI/studyplan2/account-save-themes-v6';
  const assets=['/account-v6.js','/study-v6.js','/study-v6.css','/study-v6-pagefix.css','/index.html'];
  const out=[];
  const texts={};
  for(const path of assets){
   const r=await fetch(base+path+'?v='+Date.now());
   const t=await r.text();texts[path]=t;
   let syntax=true,error=null;
   if(path.endsWith('.js')){try{new Function(t)}catch(e){syntax=false;error=String(e.message||e)}}
   out.push({path,status:r.status,ok:r.ok,bytes:t.length,syntax,error});
  }
  const index=texts['/index.html']||'';
  const accountPos=index.indexOf('account-v6.js'),script1Pos=index.indexOf('script1.js'),v6Pos=index.indexOf('study-v6.js');
  const account=texts['/account-v6.js']||'',ui=texts['/study-v6.js']||'';
  const checks={
   all200:out.every(x=>x.ok),
   syntax:out.filter(x=>x.path.endsWith('.js')).every(x=>x.syntax),
   accountBeforeApp:accountPos>=0&&script1Pos>accountPos,
   v6Loaded:v6Pos>script1Pos,
   stylesLoaded:index.includes('study-v6.css')&&index.includes('study-v6-pagefix.css'),
   accountScoping:account.includes("sp6:u:${id}:")&&account.includes('PBKDF2')&&account.includes('migrateLegacy'),
   independentPages:ui.includes('leftDate')&&ui.includes('rightDate')&&ui.includes('wfLeftPrev')&&ui.includes('wfRightNext'),
   importer:ui.includes('parseNoteBlocks')&&ui.includes('parseCards')&&ui.includes('userFlashcardsV6'),
   themes:ui.includes('studyThemeV6')&&ui.includes('data-theme=\\"green\\"')
  };
  res.status(200).json({ok:Object.values(checks).every(Boolean),checks,out});
 }catch(e){res.status(500).json({ok:false,error:String(e.message||e)})}
}