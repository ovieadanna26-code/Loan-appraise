// Final returned-appraisal guard: prevents the returned application from being lost at submit time.
(()=>{
 const KEY='loanappraise_returned_session';
 const num=v=>{const n=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:0};
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
 const apps=()=>window.apps||[];
 const get=()=>{const s=read();if(!s)return null;return apps().find(a=>String(a.id)===String(s.applicationId))||null};
 const force=()=>{const s=read(),a=get();if(!s||!a)return;const sel=document.getElementById('appraisalApplication');if(sel){const id=String(a.id);let o=[...sel.options].find(x=>String(x.value)===id);if(!o){o=document.createElement('option');o.value=id;o.textContent=(a.reference||'Application')+' — '+((a.customers||{}).full_name||s.customerName||'Customer')+' (Returned for Correction)';sel.appendChild(o)}if(sel.value!==id){sel.value=id;sel.dispatchEvent(new Event('change',{bubbles:true}))}}
  const rec=num(a.recommended_amount||a.recommendedAmount||a.amount);const input=document.getElementById('overrideRecommended');if(input&&rec>0&&(!input.value||num(input.value)===0))input.value=rec;
  const c=a.customers||{};const income=num(c.monthly_income||c.income||a.monthly_income);const expenses=num(c.monthly_expenses||c.expenses||a.monthly_expenses);const incomeBox=document.getElementById('appraisalIncomeDisplay');if(incomeBox)incomeBox.textContent=new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(income);const expBox=document.getElementById('appraisalExpenseDisplay');if(expBox)expBox.textContent=new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(expenses);
 };
 function install(){const f=document.getElementById('appraisalForm');if(!f||f.dataset.returnedGuard)return;f.dataset.returnedGuard='1';f.addEventListener('submit',()=>{force();const s=document.getElementById('appraisalApplication');if(s&&read()&&get()&&s.value!==String(read().applicationId)){s.value=String(read().applicationId);s.dispatchEvent(new Event('change',{bubbles:true}))}},true);force()}
 document.addEventListener('DOMContentLoaded',()=>{install();setInterval(()=>{install();force()},300)});new MutationObserver(()=>{install();force()}).observe(document.body,{childList:true,subtree:true});
})();