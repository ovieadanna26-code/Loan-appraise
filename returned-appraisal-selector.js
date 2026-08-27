// Ensure a returned application is actually selected before the appraisal submit handler runs.
(()=>{
 const sel=()=>document.getElementById('appraisalApplication');
 const apps=()=>Array.isArray(window.apps)?window.apps:[];
 const returned=a=>{const s=String(a?.status||a?.workflow_status||'').toLowerCase().replace(/[\s-]+/g,'_');return ['returned','returned_for_correction','correction_required','needs_correction'].some(x=>s.includes(x))};
 function sync(){const s=sel();if(!s)return;const list=apps().filter(returned);const existing=new Set([...s.options].map(o=>String(o.value)));list.forEach(a=>{if(!a?.id||existing.has(String(a.id)))return;const o=document.createElement('option');o.value=a.id;o.textContent=`${a.reference||a.application_no||'Application'} — ${a.customers?.full_name||a.customer_name||'Customer'} (Returned for Correction)`;s.appendChild(o)});if(list.length===1 && (!s.value||!apps().some(a=>String(a.id)===String(s.value)))){s.value=String(list[0].id);s.dispatchEvent(new Event('change',{bubbles:true}))}}
 function beforeSubmit(e){const s=sel();if(!s)return;const valid=apps().find(a=>String(a.id)===String(s.value));if(valid)return;const r=apps().find(returned);if(r){s.value=String(r.id);s.dispatchEvent(new Event('change',{bubbles:true}));return} }
 document.addEventListener('DOMContentLoaded',()=>{sync();const f=document.getElementById('appraisalForm');f?.addEventListener('submit',beforeSubmit,true)});setInterval(sync,500);
})();