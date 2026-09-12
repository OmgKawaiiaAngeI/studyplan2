(()=>{
  const sessionCards=[
    ['When combining like terms such as 3x² + 5x², what happens to the exponent?','Add the coefficients and keep the exponent unchanged: 3x² + 5x² = 8x².'],
    ['Why does 3x × 15 equal 45x instead of 45?','Because the x is part of 3x and does not disappear. Multiply the numbers 3 × 15 = 45 and keep x, giving 45x.'],
    ['What happens when a minus sign is in front of a whole bracket, like −(x² + x)?','Every sign inside flips when the bracket is removed: −(x² + x) = −x² − x.'],
    ['What is a negative multiplied by a negative?','A positive. Example: −7(−2y) = +14y.'],
    ['What coefficient does x have when no number is written in front?','1. So x = 1x, which means 45x − x = 45x − 1x = 44x.'],
    ['What is the usual order for writing a simplified algebraic expression?','Write terms from highest power to lowest power, then the constant. Example: 8x² − 5x + 3.']
  ];

  function installCards(){
    try{
      if(typeof flashcards==='undefined') return false;
      const topic='Algebra 1 — My tricky spots';
      if(!flashcards[topic]) flashcards[topic]=[];
      sessionCards.forEach(card=>{
        if(!flashcards[topic].some(existing=>existing[0]===card[0])) flashcards[topic].push(card);
      });
      const select=document.getElementById('topicSelect');
      if(select && !Array.from(select.options).some(o=>o.value===topic)){
        const opt=document.createElement('option'); opt.value=topic; opt.textContent=topic; select.appendChild(opt);
      }
      return true;
    }catch(e){ return false; }
  }

  // Today's Algebra 1 work: 8 questions ≈ 1 page. Add it to the user's prior 9 pages,
  // but never reduce a browser that already has more progress recorded.
  function migrateProgress(){
    try{
      const target=12; // book begins on p.3, so p.3–12 represents 10 completed pages
      const stored=JSON.parse(localStorage.getItem('pagesDoneUpTo')||'2');
      if(stored<target) localStorage.setItem('pagesDoneUpTo',JSON.stringify(target));
      if(typeof pagesDoneUpTo!=='undefined' && pagesDoneUpTo<target){
        pagesDoneUpTo=target;
        if(typeof renderPlanner==='function') renderPlanner();
      }
    }catch(e){}
  }

  let tries=50;(function wait(){
    const cardsReady=installCards();
    migrateProgress();
    if(cardsReady) return;
    if(tries-->0) setTimeout(wait,100);
  })();
})();