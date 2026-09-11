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
  const index=texts['/index.html']||'',account=texts['/account-v6.js']||'',ui=texts['/study-v6.js']||'';
  const accountPos=index.indexOf('account-v6.js'),script1Pos=index.indexOf('script1.js'),v6Pos=index.indexOf('study-v6.js');

  function runAccount(sessionId,backing){
   class MockStorage{
    constructor(map){this._m=map}
    get length(){return this._m.size}
    getItem(k){return this._m.has(String(k))?this._m.get(String(k)):null}
    setItem(k,v){this._m.set(String(k),String(v))}
    removeItem(k){this._m.delete(String(k))}
    clear(){this._m.clear()}
    key(i){return [...this._m.keys()][i]??null}
   }
   const local=new MockStorage(backing),session=new MockStorage(new Map());
   session.setItem('sp6:session',sessionId);
   const win={},doc={addEventListener(){},getElementById(){return null}},loc={reload(){}};
   const btoaFn=s=>Buffer.from(s,'binary').toString('base64'),atobFn=s=>Buffer.from(s,'base64').toString('binary');
   new Function('window','document','Storage','localStorage','sessionStorage','crypto','location','btoa','atob',account)(win,doc,MockStorage,local,session,globalThis.crypto,loc,btoaFn,atobFn);
   return {local,win};
  }
  const backing=new Map();
  const A=runAccount('acctA',backing);A.local.setItem('notes','alpha');
  const B=runAccount('acctB',backing);const bBefore=B.local.getItem('notes');B.local.setItem('notes','beta');
  const A2=runAccount('acctA',backing);const aAfter=A2.local.getItem('notes');
  const accountIsolation=bBefore===null&&aAfter==='alpha'&&backing.get('sp6:u:acctA:notes')==='alpha'&&backing.get('sp6:u:acctB:notes')==='beta';

  const checks={
   all200:out.every(x=>x.ok),
   syntax:out.filter(x=>x.path.endsWith('.js')).every(x=>x.syntax),
   accountBeforeApp:accountPos>=0&&script1Pos>accountPos,
   v6Loaded:v6Pos>script1Pos,
   stylesLoaded:index.includes('study-v6.css')&&index.includes('study-v6-pagefix.css'),
   accountScoping:account.includes("sp6:u:${id}:")&&account.includes('PBKDF2')&&account.includes('migrateLegacy'),
   accountIsolation,
   independentPages:ui.includes('leftDate')&&ui.includes('rightDate')&&ui.includes('wfLeftPrev')&&ui.includes('wfRightNext'),
   importer:ui.includes('parseNoteBlocks')&&ui.includes('parseCards')&&ui.includes('userFlashcardsV6'),
   themes:ui.includes('studyThemeV6')&&ui.includes('data-theme="green"')&&ui.includes('data-theme="mono"')&&ui.includes('data-theme="gray"'),
   backup:ui.includes('sp6Export')&&ui.includes('sp6Restore')&&ui.includes('window.StudyAccounts')
  };
  res.status(200).json({ok:Object.values(checks).every(Boolean),checks,out});
 }catch(e){res.status(500).json({ok:false,error:String(e.stack||e.message||e)})}
}