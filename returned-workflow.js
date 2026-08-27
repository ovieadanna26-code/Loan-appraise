// Guided returned-application workflow: one selection carries through KYC, identity, application and appraisal.
(()=>{
 const KEY='loanappraise_returned_session';
 const qs=s=>document.querySelector(s);
 const getApps=()=>window.apps||[];
 const isReturned=a=>['returned','returned_for_correction','correction_required'].includes(String(a?.status||'').toLowerCase())||a?.returned_for_correction===true;
 const findReturned=()=>getApps().find(isReturned);
 function setSession(a){if(!a)return null;const c=a.customers||{};const s={applicationId:a.id,customerId:c.id||a.customer_id||a.customerId,reference:a.reference||a.application_number||'',customerName:c.full_name||a.customer_name||'',reason:a.return_reason||a.supervisor_comment||a.decision_comment||''};localStorage.setItem(KEY,JSON.stringify(s));window.returnedApplicationSession=s;return s}
 function session(){try{return window.returnedApplicationSession||JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
 function findApp(s){return getApps().find(a=>String(a.id)===String(s?.applicationId))||findReturned()}
 function select(id,value){const e=document.getElementById(id);if(!e||value==null)return;const v=String(value);let opt=[...e.options].find(o=>String(o.value)===v);if(!opt){const a=findApp(session());if(a){opt=document.createElement('option');opt.value=a.id;opt.textContent=(a.reference||'Application')+' — '+((a.customers||{}).full_name||'Customer')+' (Returned for Correction)';e.appendChild(opt)}}if(opt){e.value=opt.value;e.dispatchEvent(new Event('change',{bubbles:true}))}}
 function activatePage(id){const b=document.querySelector(`[data-page="${id}"]`);if(b)b.click();const p=document.getElementById(id);if(p){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));p.classList.add('active')}}
 function announce(s){if(!s)return;document.querySelectorAll('.returned-session-banner').forEach(x=>x.remove());const pages=['customers','identity','application','appraisal'];pages.forEach(id=>{const p=document.getElementById(id);if(!p)return;const b=document.createElement('div');b.className='returned-session-banner';b.innerHTML=`<strong>↩ Returned Application</strong> <span>${s.reference||''} — ${s.customerName||'Customer'}</span><small>${s.reason?'Correction requested: '+s.reason:'Continue with the selected returned application.'}</small>`;p.prepend(b)})}
 function prepare(){const s=session();if(!s)return;const a=findApp(s);if(!a)return;setSession(a);const c=a.customers||{};select('appCustomer',s.customerId||c.id);select('identityCustomer',s.customerId||c.id);select('appraisalApplication',a.id);announce(session())}
 function start(a){const s=setSession(a);announce(s);prepare();activatePage('customers')}
 function wire(){document.querySelectorAll('[data-returned-application]').forEach(b=>{if(b.dataset.wired)return;b.dataset.wired='1';b.addEventListener('click',e=>{e.preventDefault();const a=findApp({applicationId:b.dataset.returnedApplication})||findReturned();if(a)start(a)})});prepare()}
 window.startReturnedApplication=start;window.getReturnedApplicationSession=session;
 const st=document.createElement('style');st.textContent='.returned-session-banner{margin:0 0 16px;padding:13px 15px;border:1px solid #fdba74;background:#fff7ed;border-radius:10px;color:#7c2d12}.returned-session-banner strong{display:block}.returned-session-banner span{display:block;font-weight:600;margin-top:3px}.returned-session-banner small{display:block;margin-top:5px}.returned-session-banner{position:relative;z-index:5}';document.head.appendChild(st);
 document.addEventListener('DOMContentLoaded',()=>{wire();setInterval(wire,800)});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b&&['customers','identity','application','appraisal'].includes(b.dataset.page))setTimeout(prepare,80)});
})();