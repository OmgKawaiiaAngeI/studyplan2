(()=>{
const mistakes=[
 {q:'When combining like terms such as 3x² + 5x², what happens to the exponent?',a:'Add the coefficients and keep the exponent unchanged: 3x² + 5x² = 8x².'},
 {q:'Why does 3x × 15 equal 45x instead of 45?',a:'The x does not disappear. Multiply 3 × 15 and keep x: 45x.'},
 {q:'What happens when a minus sign is in front of a whole bracket, like −(x² + x)?',a:'Every sign inside flips: −(x² + x) = −x² − x.'},
 {q:'What is a negative multiplied by a negative?',a:'A positive. Example: −7(−2y) = +14y.'},
 {q:'What coefficient does x have when no number is written in front?',a:'1. So x = 1x, and 45x − x = 44x.'},
 {q:'What is the usual order for writing a simplified algebraic expression?',a:'Highest power to lowest power, then the constant. Example: 8x² − 5x + 3.'}
];
let i=0,flipped=false;
function render(){
 const count=document.getElementById('mistakeCount'),pos=document.getElementById('mistakeFcProgress'),front=document.getElementById('mistakeFcFront'),back=document.getElementById('mistakeFcBack');
 if(!count||!pos||!front||!back)return;
 count.textContent=mistakes.length;
 pos.textContent=(i+1)+' / '+mistakes.length;
 front.textContent=mistakes[i].q; back.textContent=mistakes[i].a;
 front.style.display=flipped?'none':'flex'; back.style.display=flipped?'flex':'none';
}
function init(){
 const tab=document.querySelector('.tab[data-view="mistakes"]'); if(!tab)return;
 document.getElementById('mistakeFcFlip')?.addEventListener('click',()=>{flipped=!flipped;render();});
 document.getElementById('mistakeFcPrev')?.addEventListener('click',()=>{i=(i-1+mistakes.length)%mistakes.length;flipped=false;render();});
 document.getElementById('mistakeFcNext')?.addEventListener('click',()=>{i=(i+1)%mistakes.length;flipped=false;render();});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();