/* Hide the legacy Loan Officer workflow while preserving its backend/data. */
(function(){'use strict';
function apply(){
 const officer=window.profile&&String(window.profile.role||'').toLowerCase()==='officer';
 if(!officer)return;
 document.body.classList.add('clean-loan-officer-only');
 ['customers','identity','application','appraisal'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add('legacy-officer-hidden');});
 document.querySelectorAll('.app-shell aside button').forEach(b=>{
   const p=b.getAttribute('data-page');
   if(['customers','identity','application','appraisal'].includes(p))b.classList.add('legacy-officer-hidden');
 });
 const workflow=[...document.querySelectorAll('body *')].find(e=>e.children.length===0&&/Loan Processing Workflow/i.test(e.textContent||''));
 if(workflow){let box=workflow;for(let i=0;i<4&&box.parentElement;i++)box=box.parentElement;if(box)box.classList.add('legacy-workflow-hidden');}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,700));else setTimeout(apply,700);
window.addEventListener('loanOfficerReady',apply);
})();
