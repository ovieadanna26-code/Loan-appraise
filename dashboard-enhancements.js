// OVAD AFRIKA LoanAppraise dashboard enhancements
(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const statusLabel=s=>({draft:'Draft',in_progress:'In Progress',submitted:'Awaiting Supervisor',pending:'Awaiting Supervisor',returned:'Returned for Correction',approved:'Approved',declined:'Declined'})[String(s||'').toLowerCase()]||String(s||'Unknown');
 function safeInsert(parent,node,reference){
  if(!parent||!node)return;
  if(reference&&reference.parentNode===parent) parent.insertBefore(node,reference);
  else parent.appendChild(node);
 }
 function inject(){
  const d=document.getElementById('dashboard');
  const shell=document.getElementById('appShell');
  if(!d||!shell||shell.classList.contains('hidden')||document.getElementById('roleDashboard'))return;
  const wrap=document.createElement('div');wrap.id='roleDashboard';wrap.innerHTML=`<div class="workflow-card card"><h2>Loan Processing Workflow</h2><div class="workflow-steps"><span data-step="customers">1. KYC</span><i>→</i><span data-step="identity">2. Photo & Signature</span><i>→</i><span data-step="application">3. Loan Application</span><i>→</i><span data-step="appraisal">4. Appraisal</span><i>→</i><span data-step="approvals">5. Supervisor Decision</span></div></div><div class="task-grid"><div class="task-card"><small>My / Pending Applications</small><b id="dashMyApps">0</b><button type="button" data-dash="applications">View Applications →</button></div><div class="task-card"><small>Returned for Correction</small><b id="dashReturned">0</b><button type="button" data-dash="appraisal">Review Returned →</button></div><div class="task-card"><small>Awaiting Supervisor</small><b id="dashPending">0</b><button type="button" data-dash="approvals">Open Approval Queue →</button></div><div class="task-card"><small>Approved</small><b id="dashApproved">0</b><button type="button" data-dash="applications">View Approved →</button></div></div>`;
  const stats=d.querySelector('.stats');
  safeInsert(d,wrap,stats?stats.nextSibling:null);
  wrap.querySelectorAll('[data-dash]').forEach(b=>b.onclick=()=>document.querySelector(`[data-page="${b.dataset.dash}"]`)?.click());
 }
 function enhance(){
  try{
   inject();
   const role=(window.currentProfile?.role||window.userProfile?.role||window.currentUserRole||'').toLowerCase();
   const sup=role.includes('supervisor');
   document.querySelectorAll('[data-step="approvals"]').forEach(x=>x.style.display=sup?'inline-flex':'none');
   document.querySelectorAll('[data-step]').forEach((x,i)=>{x.classList.toggle('active',i===0)});
   const all=document.getElementById('all');
   if(all&&!all.dataset.enhanced){
    const table=all.closest('table');
    if(table&&!document.getElementById('applicationSearch')){
     all.dataset.enhanced='1';
     const bar=document.createElement('div');bar.className='card app-filter';bar.innerHTML='<input id="applicationSearch" placeholder="Search customer or loan reference…"><select id="applicationStatus"><option value="">All statuses</option><option>Draft</option><option>In Progress</option><option>Awaiting Supervisor</option><option>Returned for Correction</option><option>Approved</option><option>Declined</option></select>';
     safeInsert(table.parentNode,bar,table);
     const filter=()=>{const q=(document.getElementById('applicationSearch')?.value||'').toLowerCase(),s=(document.getElementById('applicationStatus')?.value||'').toLowerCase();all.querySelectorAll('tr').forEach(r=>{const t=r.textContent.toLowerCase();r.style.display=(!q||t.includes(q))&&(!s||t.includes(s))?'':'none'});};
     document.getElementById('applicationSearch').oninput=filter;document.getElementById('applicationStatus').onchange=filter;
    }
   }
  }catch(e){console.warn('Dashboard enhancement skipped:',e.message)}
 }
 const obs=new MutationObserver(enhance);document.addEventListener('DOMContentLoaded',()=>{obs.observe(document.body,{childList:true,subtree:true});enhance()});setInterval(enhance,1500);
})();
