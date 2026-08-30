// Fix: make Customer > Save & Continue visibly report persistence errors and only advance after a successful save.
(function(){
  document.addEventListener('click', async function(e){
    const btn=e.target.closest('#next');
    if(!btn || typeof validate!=='function') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(!validate()) return;
    btn.disabled=true;
    const old=btn.textContent; btn.textContent='Saving…';
    try {
      await persist('draft');
      step=Math.min(7,step+1);
      renderWizard();
    } catch(err) {
      console.error('Customer save failed:',err);
      const message=err?.message||String(err);
      let box=document.getElementById('save-error');
      if(!box){ box=document.createElement('div'); box.id='save-error'; box.className='error'; box.style.marginTop='12px'; btn.parentElement.appendChild(box); }
      box.textContent='Could not save customer/application: '+message;
      btn.disabled=false; btn.textContent=old;
    }
  }, true);
})();
