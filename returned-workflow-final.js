// Final returned-work repair. Hooks the real correction entry point and preserves application values.
(()=>{
 const KEY='loanappraise_returned_session';
 const num=v=>{const n=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:0};
 const apps=()=>window.apps||[];
 const get=id=>apps().find(a=>String(a.id)===String(id));
 function save(a){if(!a)return;const c=a.customers||{};const s={applicationId:a.id,customerId:c.id||a.customer_id,reference:a.reference||a.application_number||'',customerName:c.full_name||a.customer_name||'',requested:a.requested_amount||a.amount||0,recommended:a.recommended_amount||a.recommended||0,tenure:a.tenure_months||a.tenure||12,rate:a.interest_rate||a.rate||25,debt:a.existing_monthly_debt||a.existing_debt||0,reason:a.return_reason||a.supervisor_comment||a.decision_comment||''};localStorage.setItem(KEY,JSON.stringify(s));window.returnedApplicationSession=s;return s}
 function load(){try{return window.returnedApplicationSession||JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
 function hydrate(){const s=load();if(!s)return;const a=get(s.applicationId);if(!a)return;const c=a.customers||{};
  const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!==undefined&&v!==null){e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))}};
  set('appCustomer',s.customerId||c.id);set('identityCustomer',s.customerId||c.id);set('appraisalApplication',s.applicationId);
  set('appAmount',num(s.requested));set('appTenure',num(s.tenure)||12);set('appRate',num(s.rate)||25);set('appDebt',num(s.debt));
  const rec=document.getElementById('overrideRecommended');if(rec&&num(s.recommended)>0)rec.value=num(s.recommended);
 }
 function start(id){const a=get(id);if(!a)return;save(a);hydrate();document.querySelector('[data-page="customers"]')?.click();setTimeout(hydrate,100);}
 window.startCorrection=function(id){start(id)};
 window.startReturnedApplication=function(a){start(typeof a==='object'?a.id:a)};
 document.addEventListener('click',e=>{const b=e.target.closest('[onclick*="startCorrection"]');if(b){const m=b.getAttribute('onclick').match(/startCorrection\(['"]?([^'"\)]+)['"]?\)/);if(m)start(m[1])}});
 function protect(){hydrate();const s=load();const f=document.getElementById('appraisalForm');if(!f||!s)return;if(!f.dataset.returnedProtect){f.dataset.returnedProtect='1';f.addEventListener('submit',e=>{const a=get(s.applicationId);if(!a)return;const sel=document.getElementById('appraisalApplication');if(sel){sel.value=String(s.applicationId);sel.dispatchEvent(new Event('change',{bubbles:true}))}const rec=document.getElementById('overrideRecommended');if(rec&&num(rec.value)<=0&&num(s.recommended)>0)rec.value=num(s.recommended);},true)}}
 document.addEventListener('DOMContentLoaded',()=>{setInterval(protect,400);protect()});
})();