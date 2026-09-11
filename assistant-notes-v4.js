(()=>{
  // Notes added here by ChatGPT after the user sends them in chat.
  // Each note imports once into the browser's existing persistent myNotes store.
  const incoming=[];
  function importNotes(){
    try{
      if(typeof myNotes==='undefined'||typeof saveMn!=='function'||typeof renderMnList!=='function')return false;
      let changed=false;
      incoming.forEach(n=>{
        if(!n||!n.id)return;
        if(!myNotes.some(x=>x.id===n.id)){
          myNotes.push({id:n.id,category:n.category||'General',title:n.title||'Untitled note',body:n.body||''});
          changed=true;
        }
      });
      if(changed){saveMn();if(typeof populateMnCategoryList==='function')populateMnCategoryList();renderMnList();}
      return true;
    }catch(e){return false}
  }
  let tries=50;(function wait(){if(importNotes())return;if(tries-->0)setTimeout(wait,100)})();
})();