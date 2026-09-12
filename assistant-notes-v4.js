(()=>{
  // Notes added here by ChatGPT after the user sends them in chat.
  // Each note imports once into the browser's existing persistent myNotes store.
  const incoming=[
    {
      id:'math-algebra-combining-like-terms-20260911',
      category:'Maths → Algebra → Simplifying Expressions',
      title:'Combining like terms with exponents',
      body:'When adding like terms, add the coefficients (the numbers in front) and keep the exponent unchanged. Do NOT square the coefficients first. Example: 3x² + 5x² = 8x², because 3 + 5 = 8 and x² stays x².'
    },
    {
      id:'math-algebra-standard-term-order-20260911',
      category:'Maths → Algebra → Simplifying Expressions',
      title:'Order of terms in a simplified expression',
      body:'Changing the order of terms does not change the value as long as each sign stays attached to its term. However, the standard/neater form is to write terms from highest power to lowest power, then the constant. Example: -5x + 8x² + 3 is equivalent to 8x² - 5x + 3, but 8x² - 5x + 3 is the preferred standard form. Always keep the exponent: 8x² must not accidentally become 8x.'
    },
    {
      id:'math-algebra-subtracting-brackets-20260911',
      category:'Maths → Algebra → Expanding and Simplifying Expressions',
      title:'Subtracting a bracket flips its signs',
      body:'When a whole bracket is being subtracted, the signs of every term inside that bracket change when the bracket is removed. A positive becomes negative, and a negative becomes positive. Example: a(a+b) - a(2a-b). First expand to get a² + ab - (2a² - ab). Removing the subtracted bracket gives a² + ab - 2a² + ab, because subtracting -ab becomes +ab. Then simplify to -a² + 2ab.'
    },
    {
      id:'math-algebra-minus-before-positive-bracket-20260912',
      category:'Maths → Algebra → Expanding and Simplifying Expressions',
      title:'A minus before a bracket changes every sign',
      body:'If a minus sign is in front of a whole bracket, change the sign of EVERY term when removing the bracket. Example: -(x² + x) becomes -x² - x. So in 3x² + 45x - (x² + x), the x² and x both become negative, giving 3x² + 45x - x² - x.'
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