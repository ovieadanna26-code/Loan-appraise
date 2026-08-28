/* Ensures the clean Loan Officer UI takes over immediately after the legacy login completes. */
(function(){'use strict';
function force(){
 const p=window.profile;
 if(!p)return;
 const role=String(p.role||'').toLowerCase().replace(/[ -]/g,'_');
 if(!['officer','loan_officer'].includes(role))return;
 const legacy=document.getElementById('appShell'); if(legacy)legacy.style.display='none';
 window.dispatchEvent(new Event('loanOfficerReady'));
}
setTimeout(force,500);setTimeout(force,1500);setTimeout(force,3000);
window.addEventListener('loanOfficerReady',force);
})();
