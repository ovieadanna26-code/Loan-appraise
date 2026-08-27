// Definitive returned-appraisal submit fix: intercepts the real form handler, restores the returned ID, and calls the original handler with the correct selection.
(()=>{
 const KEY='loanappraise_returned_session';
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
 const n=v=>{const x=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(x)?x:0};
 const install=()=>{const f=document.getElementById('appraisalForm');if(!f||f.dataset.definitiveReturnedFix)return;const s=read();if(!s?.applicationId)return;const original=f.onsubmit;if(typeof original!=='function')return;f.dataset.definitiveReturnedFix='1';f.addEventListener('submit',e=>{
   const sel=document.getElementById('appraisalApplication');
   const apps=window.apps||[];const a=apps.find(x=>String(x.id)===String(s.applicationId));
   if(!a){alert('The returned application could not be loaded. Please refresh the application and try again.');e.preventDefault();e.stopImmediatePropagation();return;}
   if(sel){let opt=[...sel.options].find(o=>String(o.value)===String(s.applicationId));if(!opt){opt=document.createElement('option');opt.value=a.id;opt.textContent=`${a.reference||'Application'} — ${(a.customers||{}).full_name||s.customerName||'Customer'} (Returned for Correction)`;sel.appendChild(opt)}sel.value=String(s.applicationId);}
   const rec=document.getElementById('overrideRecommended');const saved=n(s.recommended);if(rec&&saved>0)rec.value=rec.value&&n(rec.value)>0?rec.value:saved;
   // Call the application's real Supabase appraisal handler ourselves with the corrected state.
   e.preventDefault();e.stopImmediatePropagation();
   try{const r=original.call(f,e);if(r&&typeof r.then==='function')r.catch(err=>alert(err.message||String(err)))}catch(err){alert(err.message||String(err))}
 },true);
 };
 document.addEventListener('DOMContentLoaded',()=>{install();setInterval(install,250)});
 new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
})();