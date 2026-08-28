/* Modern Loan Officer landing view. Uses the existing application page and avoids fragile DOM insertion. */
(function(){'use strict';
  function officer(){return !!(window.profile&&/officer/i.test(String(window.profile.role||'')));}
  function show(id){
    document.querySelectorAll('main .page').forEach(function(s){s.classList.remove('active');s.style.display='none';});
    var target=document.getElementById(id); if(!target)return false;
    target.classList.add('active'); target.style.display='block'; return true;
  }
  function activate(){
    if(!officer()) return;
    document.body.classList.add('loan-officer-mode');
    var dash=document.getElementById('dashboard'); if(!dash)return;
    show('dashboard');
    if(!dash.querySelector('.lo-welcome')){
      var box=document.createElement('div'); box.className='lo-welcome';
      box.innerHTML='<div><h1>Welcome, '+(window.profile.full_name||'Loan Officer')+'</h1><p>Manage customer applications and prepare quality loan appraisals.</p></div><button class="lo-action" type="button">+ New Loan Application</button>';
      dash.appendChild(box);
      box.querySelector('.lo-action').onclick=function(){
        if(show('application') && typeof window.buildLoanOfficerApplication==='function') window.buildLoanOfficerApplication();
        else if(show('application')) window.dispatchEvent(new Event('loanApplicationOpen'));
      };
    }
  }
  function wait(){var n=0;var t=setInterval(function(){n++;if(officer()){activate();clearInterval(t);}if(n>80)clearInterval(t);},250);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
  window.addEventListener('loanOfficerReady',activate);
})();
