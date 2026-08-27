// Ensure returned-for-correction applications are selectable for re-appraisal.
(()=>{
 function isReturned(a){const s=String(a?.status||'').toLowerCase();return s.includes('return')||s==='returned_for_correction'||s==='needs_correction'}
 function repairSelect(){
  const s=document.getElementById('appraisalApplication');if(!s)return;
  const apps=window.apps||[];
  const selected=s.value;
  const wanted=apps.filter(a=>isReturned(a));
  wanted.forEach(a=>{const id=String(a.id);if(![...s.options].some(o=>String(o.value)===id)){const o=document.createElement('option');o.value=id;o.textContent=`${a.reference||'Application'} — ${a.customers?.full_name||'Customer'} (Returned for Correction)`;s.appendChild(o)}});
  if(selected&&[...s.options].some(o=>String(o.value)===selected))s.value=selected;
  if(!s.value&&wanted.length===1)s.value=String(wanted[0].id);
 }
 function selectReturned(id){const s=document.getElementById('appraisalApplication');if(!s)return;s.value=String(id);s.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('appraisal')?.scrollIntoView({behavior:'smooth',block:'start'})}
 document.addEventListener('DOMContentLoaded',repairSelect);setInterval(repairSelect,700);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-returned-application]');if(b){e.preventDefault();selectReturned(b.dataset.returnedApplication)}});
 window.selectReturnedApplication=selectReturned;
})();