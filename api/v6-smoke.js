export default async function handler(req,res){
 try{
  const base=`https://${process.env.VERCEL_URL}`;
  const assets=['/account-v6.js','/study-v6.js','/study-v6.css','/study-v6-pagefix.css','/index.html'];
  const out=[];
  for(const path of assets){const r=await fetch(base+path);const t=await r.text();let syntax=true,error=null;if(path.endsWith('.js')){try{new Function(t)}catch(e){syntax=false;error=String(e.message||e)}}out.push({path,status:r.status,ok:r.ok,bytes:t.length,syntax,error,text:path==='/index.html'?t.slice(-1200):undefined})}
  const index=out.find(x=>x.path==='/index.html')?.text||'';
  const accountPos=index.indexOf('account-v6.js'),script1Pos=index.indexOf('script1.js'),v6Pos=index.indexOf('study-v6.js');
  const checks={all200:out.every(x=>x.ok),syntax:out.filter(x=>x.path.endsWith('.js')).every(x=>x.syntax),accountBeforeApp:accountPos>=0&&script1Pos>accountPos,v6Loaded:v6Pos>script1Pos,stylesLoaded:index.includes('study-v6.css')&&index.includes('study-v6-pagefix.css')};
  res.status(200).json({ok:Object.values(checks).every(Boolean),checks,out:out.map(({text,...x})=>x)});
 }catch(e){res.status(500).json({ok:false,error:String(e.message||e)})}
}