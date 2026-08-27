// OVAD AFRIKA KYC -> application -> appraisal financial-data handoff repair
(()=>{
 const n=v=>{const x=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(x)?x:0};
 const pick=(o,...keys)=>{for(const k of keys){if(o&&o[k]!==undefined&&o[k]!==null&&o[k]!=='')return o[k]}return 0};
 function syncCustomer(id){
  if(!id)return;
  const c=(window.customers||[]).find(x=>String(x.id)===String(id)) || (window.apps||[]).map(a=>a.customers).find(x=>x&&String(x.id)===String(id));
  if(!c)return;
  const income=n(pick(c,'monthly_income','income'));
  const expenses=n(pick(c,'monthly_expenses','expenses'));
  c.monthly_income=income;c.monthly_expenses=expenses;c.income=income;c.expenses=expenses;
  localStorage.setItem('loanappraise_customer_financial_'+id,JSON.stringify({monthly_income:income,monthly_expenses:expenses,updated_at:new Date().toISOString()}));
 }
 function syncApplication(a){
  if(!a)return;
  const c=a.customers||{};
  const stored=JSON.parse(localStorage.getItem('loanappraise_customer_financial_'+(c.id||''))||'null')||{};
  const income=n(pick(c,'monthly_income','income',stored.monthly_income));
  const expenses=n(pick(c,'monthly_expenses','expenses',stored.monthly_expenses));
  const debt=n(pick(a,'existing_monthly_debt','debt'));
  a.monthly_income=income;a.monthly_expenses=expenses;a.income=income;a.expenses=expenses;a.existing_monthly_debt=debt;
  a.available_cash_flow=Math.max(0,income-expenses-debt);
  if(a.customers){a.customers.monthly_income=income;a.customers.monthly_expenses=expenses;a.customers.income=income;a.customers.expenses=expenses}
  return a;
 }
 function patch(){
  (window.customers||[]).forEach(c=>syncCustomer(c.id));
  (window.apps||[]).forEach(syncApplication);
  const app=document.getElementById('appCustomer');
  if(app&&app.value)syncCustomer(app.value);
  const sel=document.getElementById('appraisalApplication');
  if(sel&&sel.value){const a=(window.apps||[]).find(x=>String(x.id)===String(sel.value));syncApplication(a)}
 }
 document.addEventListener('DOMContentLoaded',()=>{patch();setInterval(patch,1200)});
})();