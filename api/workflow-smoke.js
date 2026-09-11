export default async function handler(req,res){
  try{
    const base='https://raw.githubusercontent.com/OmgKawaiiaAngeI/studyplan2/workflow-notebook-redesign';
    const assets=['app-shell-v3.js','workflow-notebook-v5.js','workflow-notebook-v5.css','workflow-notebook-v5-fixes.js'];
    const results=[];
    for(const path of assets){
      const r=await fetch(`${base}/${path}`,{headers:{'user-agent':'studyplan2-smoke-test'}});
      const text=await r.text();
      let syntax=true,error=null;
      if(path.endsWith('.js')){try{new Function(text)}catch(e){syntax=false;error=String(e.message||e)}}
      results.push({path,status:r.status,ok:r.ok,bytes:text.length,syntax,error});
    }
    const shellText=(await fetch(`${base}/app-shell-v3.js`)).text ? null : null;
    const checks={
      workflow:results.find(x=>x.path==='workflow-notebook-v5.js')?.ok===true,
      styling:results.find(x=>x.path==='workflow-notebook-v5.css')?.ok===true,
      shell:results.find(x=>x.path==='app-shell-v3.js')?.ok===true,
      fixes:results.find(x=>x.path==='workflow-notebook-v5-fixes.js')?.ok===true,
      syntax:results.filter(x=>x.path.endsWith('.js')).every(x=>x.syntax)
    };
    res.status(200).json({ok:Object.values(checks).every(Boolean),checks,results});
  }catch(e){res.status(500).json({ok:false,error:String(e.message||e)});}
}