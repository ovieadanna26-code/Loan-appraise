/* Modern Loan Officer landing view. No DOM insertBefore calls. */
(function(){'use strict';
  function officer(){return !!(window.profile&&/officer/i.test(String(window.profile.role||'')));}
  function activate(){
    if(!officer()) return;
    document.body.classList.add('loan-officer-mode');
    const dash=document.getElementById('dashboard'); if(!dash) return;
    document.querySelectorAll('main .page').forEach(s=>{s.classList.remove('active');s.style.display='none';});
    dash.classList.add('active'); dash.style.display='block';
    if(!dash.querySelector('.lo-welcome')){
      const box=document.createElement('div'); box.className='lo-welcome';
      box.innerHTML='<div><h1>Welcome, '+(window.profile.full_name||'Loan Officer')+'</h1><p>Manage customer applications and prepare quality loan appraisals.</p></div><button class="lo-action" type="button">+ New Loan Application</button>';
      dash.prepend(box);
      box.querySelector('.lo-action').onclick=function(){
        const target=document.getElementById('new-loan'); if(!target)return;
        document.querySelectorAll('main .page').forEach(s=>{s.classList.remove('active');s.style.display='none';});
        target.classList.add('active');target.style.display='block';
      };
    }
  }
  function wait(){let n=0;const t=setInterval(()=>{if(officer()){activate();clearInterval(t)}if(++n>80)clearInterval(t)},250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
  window.addEventListener('loanOfficerReady',activate);
})();
