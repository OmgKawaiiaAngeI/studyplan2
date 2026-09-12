(()=>{
  // Notes added here by ChatGPT after the user sends them in chat.
  // Each note imports once into the browser's existing persistent myNotes store.
  const incoming=[
    {
      id:'math-algebra-combining-like-terms-20260911',
      category:'Maths → Algebra → Simplifying Expressions',
      title:'Combining like terms with exponents',
      body:'When adding like terms, add the coefficients (the numbers in front) and keep the exponent unchanged. Do NOT square the coefficients first. Example: 3x² + 5x² = 8x², because 3 + 5 = 8 and x² stays x².'
    }
  ];
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