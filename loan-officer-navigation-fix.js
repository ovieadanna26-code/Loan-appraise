/* Final navigation bridge for the clean Loan Officer workspace. */
(function(){'use strict';
  function wire(){
    const root=document.getElementById('loClean');
    if(!root)return;
    if(!root.querySelector('[data-lo-direct-new]')){
      const side=root.querySelector('.lo-side');
      const b=document.createElement('button');
      b.type='button'; b.dataset.loDirectNew='1'; b.textContent='Customer & KYC';
      b.addEventListener('click',function(){ if(typeof window.openCleanLoanApplication==='function') window.openCleanLoanApplication(); });
      side && side.insertBefore(b,side.querySelector('[data-view="queue"]'));
    }
    root.addEventListener('click',function(e){
      const b=e.target.closest('.lo-primary');
      if(b && /new loan application/i.test(b.textContent||'')){
        e.preventDefault();
        if(typeof window.openCleanLoanApplication==='function')window.openCleanLoanApplication();
      }
    });
  }
  const timer=setInterval(function(){wire();if(document.getElementById('loClean'))clearInterval(timer)},300);
})();
