(()=>{
const wait=(fn,n=120)=>{if(fn())return;if(n)setTimeout(()=>wait(fn,n-1),100)};
wait(()=>{
  const book=document.getElementById('notesNotebookV5');
  const view=document.getElementById('view-mynotes');
  if(!book||!view)return false;
  const host=book.closest('.panel');
  if(host){const heading=host.querySelector(':scope > h2');if(heading)heading.style.display='none';host.style.background='transparent';host.style.border='0';host.style.boxShadow='none';host.style.padding='0';}
  [...view.children].forEach(el=>{if(el===host)return;if(el.classList?.contains('panel')){const h=el.querySelector(':scope > h2');if(h&&/saved notes/i.test(h.textContent||'')&&!el.querySelector('#mnList'))el.style.display='none';}});
  return true;
});
wait(()=>{
  const h=document.querySelector('header');if(!h)return false;
  h.querySelectorAll('.deco').forEach(x=>x.style.display='none');
  const sub=h.querySelector('.sub');if(sub)sub.textContent='your study space';
  return true;
});
})();