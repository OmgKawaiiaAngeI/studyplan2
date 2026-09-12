(()=>{
  function removeFloatingShop(){ document.getElementById('sp9ShopTop')?.remove(); }
  function init(){
    const side=document.getElementById('appSideNav');
    if(!side) return false;
    const settings=[...side.querySelectorAll('.secondary-section-label')].find(x=>/settings/i.test(x.textContent));
    if(!settings) return false;
    let box=document.getElementById('settingsShopBox');
    if(!box){
      box=document.createElement('div');
      box.id='settingsShopBox';
      box.innerHTML='<button class="side-link" id="settingsShopBtn" type="button"><span>🛍</span><span>Shop</span></button>';
      settings.insertAdjacentElement('afterend',box);
    }
    const btn=document.getElementById('settingsShopBtn');
    btn.onclick=()=>{
      if(window.StudyShop?.open) window.StudyShop.open();
      else setTimeout(()=>window.StudyShop?.open?.(),250);
    };
    removeFloatingShop();
    return true;
  }
  const observer=new MutationObserver(()=>removeFloatingShop());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  let n=120;(function wait(){removeFloatingShop();if(init())return;if(n-->0)setTimeout(wait,100)})();
})();