// Financial flow repair: always read the authoritative customer record from Supabase before appraisal/decision.
(()=>{
 const n=v=>{const x=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(x)?x:0};
 const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);
 const calcPayment=(p,annual,months)=>{p=n(p);annual=n(annual);months=n(months)||12;const r=annual/1200;return r?p*(r*Math.pow(1+r,months))/(Math.pow(1+r,months)-1):p/months};
 const calcPrincipal=(pay,annual,months)=>{pay=n(pay);annual=n(annual);months=n(months)||12;const r=annual/1200;return r?pay*(Math.pow(1+r,months)-1)/(r*Math.pow(1+r,months)):pay*months};
 async function authoritative(id){const {data,error}=await sb.from('customers').select('*').eq('id',id).single();if(error||!data)throw Error('Unable to load the latest KYC financial information.');return data}
 document.addEventListener('submit',async e=>{
  if(e.target.id!=='appraisalForm'||!window.profile)return;
  e.preventDefault();e.stopImmediatePropagation();
  try{
   const id=$('appraisalApplication').value;const a=(window.apps||[]).find(x=>String(x.id)===String(id));if(!a)throw Error('Select an application.');
   const c=await authoritative(a.customer_id);
   const income=n(c.monthly_income),expenses=n(c.monthly_expenses),debt=n(a.existing_monthly_debt);
   if(income<=0)throw Error('Monthly income is missing from the customer KYC. Please correct KYC before appraisal.');
   const cash=Math.max(0,income-expenses-debt),requested=n(a.amount),annual=n(a.annual_rate),tenure=n(a.tenure)||12;
   const payment=calcPayment(requested,annual,tenure),dr=income?debt/income*100:100,coll=requested?n(a.collateral_value)/requested*100:0;
   let score=(payment<=cash*.4?40:payment<=cash*.6?28:payment<=cash?15:0)+(dr<=20?20:dr<=35?15:dr<=50?8:0)+n($('stability').value)+(coll>=100?15:coll>=70?11:coll>=40?6:0)+n($('credit').value);score=Math.min(100,Math.round(score));
   const override=n($('overrideRecommended').value);const recommended=override?Math.min(override,requested):Math.max(0,Math.min(requested,calcPrincipal(cash*.4,annual,tenure)));const recommendedPayment=calcPayment(recommended,annual,tenure);
   const patch={recommended_amount:recommended,monthly_repayment:recommendedPayment,available_cash_flow:cash,appraisal_score:score,appraisal_decision:score>=75?'recommended':score>=50?'review':'not recommended',appraisal_notes:$('appraisalNotes').value, status:'pending_supervisor',appraised_by:window.profile.id,appraised_at:new Date().toISOString()};
   const {error}=await sb.from('loan_applications').update(patch).eq('id',a.id);if(error)throw error;
   a.customers=c;Object.assign(a,patch);alert(`Appraisal submitted.\nIncome: ${money(income)}\nExpenses: ${money(expenses)}\nCash flow: ${money(cash)}\nRecommended: ${money(recommended)}\nMonthly repayment: ${money(recommendedPayment)}`);await window.refresh();window.editAppId=null;window.editCustomerId=null;show('applications',false);
  }catch(err){alert(err.message||'Unable to complete appraisal.')}
 },true);
 const original=window.openReview;
 window.openReview=async id=>{
  if(window.profile?.role==='officer')return;
  try{
   const {data:a,error}=await sb.from('loan_applications').select('*,customers(*)').eq('id',id).single();if(error||!a)throw Error('Unable to load the complete application.');
   window.currentReview=a;const c=a.customers||{};const cash=n(a.available_cash_flow);const income=n(c.monthly_income),expenses=n(c.monthly_expenses),debt=n(a.existing_monthly_debt);const derivedCash=Math.max(0,income-expenses-debt);
   $('decisionComment').value='';$('reviewContent').innerHTML=`<div class="review-grid"><div><h3>1. Customer KYC & Financial Capacity</h3><p><b>Name:</b> ${c.full_name||'—'}</p><p><b>Phone:</b> ${c.phone||'—'} &nbsp; <b>NIN:</b> ${c.nin||'—'} &nbsp; <b>BVN:</b> ${c.bvn||'—'}</p><p><b>Employment:</b> ${c.employment_type||'—'} / ${c.employer_or_business||'—'}</p><p><b>Monthly Income:</b> ${money(income)}</p><p><b>Monthly Expenses:</b> ${money(expenses)}</p><p><b>Existing Monthly Debt:</b> ${money(debt)}</p><p><b>Calculated Available Cash Flow:</b> ${money(derivedCash)}</p></div><div><h3>2. Loan Request & Appraisal</h3><p><b>Reference:</b> ${a.reference||'—'}</p><p><b>Product:</b> ${a.product||'—'} &nbsp; <b>Purpose:</b> ${a.purpose||'—'}</p><p><b>Requested Amount:</b> ${money(a.amount)}</p><p><b>Tenure:</b> ${a.tenure||'—'} months &nbsp; <b>Rate:</b> ${a.annual_rate||'—'}%</p><p><b>Recommended Amount:</b> ${money(a.recommended_amount)}</p><p><b>Monthly Repayment:</b> ${money(a.monthly_repayment)}</p><p><b>Available Cash Flow at Appraisal:</b> ${money(cash||derivedCash)}</p><p><b>Appraisal Score:</b> ${a.appraisal_score??'—'} / 100</p><p><b>Appraisal Decision:</b> ${a.appraisal_decision||'—'}</p><p><b>Officer Notes:</b> ${a.appraisal_notes||'—'}</p></div></div><div class="affordability-summary"><b>Affordability check:</b> ${n(a.monthly_repayment)<=derivedCash*.4?'Within 40% cash-flow threshold':'Above 40% cash-flow threshold — review carefully.'}</div>`;$('reviewCard').classList.remove('hidden');
  }catch(err){alert(err.message);if(original)original(id)}
 };
})();