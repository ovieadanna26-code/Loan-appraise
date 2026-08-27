// Financial flow repair: authoritative KYC data + returned-application context.
(()=>{
 const n=v=>{const x=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(x)?x:0};
 const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);
 const calcPayment=(p,annual,months)=>{p=n(p);annual=n(annual);months=n(months)||12;const r=annual/1200;return r?p*(r*Math.pow(1+r,months))/(Math.pow(1+r,months)-1):p/months};
 const calcPrincipal=(pay,annual,months)=>{pay=n(pay);annual=n(annual);months=n(months)||12;const r=annual/1200;return r?pay*(Math.pow(1+r,months)-1)/(r*Math.pow(1+r,months)):pay*months};
 const returned=()=>{try{return JSON.parse(localStorage.getItem('loanappraise_returned_session')||'null')}catch{return null}};
 async function authoritative(id){const {data,error}=await sb.from('customers').select('*').eq('id',id).single();if(error||!data)throw Error('Unable to load the latest KYC financial information.');return data}
 document.addEventListener('submit',async e=>{
  if(e.target.id!=='appraisalForm')return;
  e.preventDefault();e.stopImmediatePropagation();
  try{
   const {data:{user}}=await sb.auth.getUser();if(!user)throw Error('Your session has expired. Please sign in again.');
   const session=returned();const selector=document.getElementById('appraisalApplication');
   const selectedId=selector?.value||session?.applicationId||'';
   if(selector&&session?.applicationId&&String(selectedId)!==String(session.applicationId))selector.value=String(session.applicationId);
   const id=selector?.value||selectedId;
   const a=(window.apps||[]).find(x=>String(x.id)===String(id));
   if(!a)throw Error('The returned application could not be loaded. Please open the returned file again.');
   const c=await authoritative(a.customer_id);const income=n(c.monthly_income),expenses=n(c.monthly_expenses),debt=n(a.existing_monthly_debt);
   if(income<=0)throw Error('Monthly income is missing from Customer KYC. Please correct KYC before appraisal.');
   const cash=Math.max(0,income-expenses-debt),requested=n(a.amount),annual=n(a.annual_rate),tenure=n(a.tenure)||12;
   const payment=calcPayment(requested,annual,tenure),dr=income?debt/income*100:100,coll=requested?n(a.collateral_value)/requested*100:0;
   let score=(payment<=cash*.4?40:payment<=cash*.6?28:payment<=cash?15:0)+(dr<=20?20:dr<=35?15:dr<=50?8:0)+n($('stability').value)+(coll>=100?15:coll>=70?11:coll>=40?6:0)+n($('credit').value);score=Math.min(100,Math.round(score));
   const override=n($('overrideRecommended').value);const saved=n(session?.recommended??a.recommended_amount);const recommended=override?Math.min(override,requested):saved>0?Math.min(saved,requested):Math.max(0,Math.min(requested,calcPrincipal(cash*.4,annual,tenure)));const recommendedPayment=calcPayment(recommended,annual,tenure);
   const patch={recommended_amount:recommended,monthly_repayment:recommendedPayment,available_cash_flow:cash,appraisal_score:score,appraisal_decision:score>=75?'recommended':score>=50?'review':'not recommended',appraisal_notes:$('appraisalNotes').value,status:'pending_supervisor',appraised_by:user.id,appraised_at:new Date().toISOString()};
   const {error}=await sb.from('loan_applications').update(patch).eq('id',a.id);if(error)throw error;
   if(window.apps){const local=window.apps.find(x=>String(x.id)===String(a.id));if(local){local.customers=c;Object.assign(local,patch)}}
   localStorage.removeItem('loanappraise_returned_session');window.returnedApplicationSession=null;window.editAppId=null;window.editCustomerId=null;
   alert(`Appraisal submitted successfully.\nMonthly income: ${money(income)}\nMonthly expenses: ${money(expenses)}\nAvailable cash flow: ${money(cash)}\nRecommended amount: ${money(recommended)}\nMonthly repayment: ${money(recommendedPayment)}`);
   if(window.refresh)await window.refresh();if(typeof show==='function')show('applications',false);
  }catch(err){alert(err.message||'Unable to complete appraisal.')}
 },true);
 const original=window.openReview;
 window.openReview=async id=>{try{const {data:a,error}=await sb.from('loan_applications').select('*,customers(*)').eq('id',id).single();if(error||!a)throw Error('Unable to load the complete application.');const local=(window.apps||[]).find(x=>String(x.id)===String(id));if(local){Object.assign(local,a);local.customers=a.customers}if(original)original(id)}catch(err){alert(err.message||'Unable to load the complete application.')}};
})();