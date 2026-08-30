/* LoanAppraise 2.0 wizard reliability + live calculation fix. */
(function(){
  'use strict';
  const moneyKeys=new Set(['amount','average_daily_sales','monthly_purchases','rent','salaries','utilities','transport','other_business_expenses','cash_at_hand','bank_balance_1','accounts_receivable','supplier_liabilities','bank_loans','other_borrowings','equipment_value','vehicle_value','property_value','other_assets','market_value','forced_sale_value']);
  const num=v=>Number(String(v??'').replace(/,/g,''))||0;
  const fmt=v=>'₦'+num(v).toLocaleString('en-NG',{maximumFractionDigits:0});
  let bypass=false;
  function fields(){return [...document.querySelectorAll('[data-key]')];}
  function val(k){const e=document.querySelector(`[data-key="${k}"]`);return num(e?.value);}
  function setMetric(label,value){document.querySelectorAll('.metric').forEach(m=>{const s=m.querySelector('small');const b=m.querySelector('b');if(s&&b&&s.textContent.trim()===label)b.textContent=fmt(value);});}
  function recalc(){
    const monthlySales=val('average_daily_sales')*num(document.querySelector('[data-key="business_days"]')?.value);
    const cashFlow=monthlySales-val('monthly_purchases')-val('rent')-val('salaries')-val('utilities')-val('transport')-val('other_business_expenses');
    const assets=['equipment_value','vehicle_value','property_value','other_assets','cash_at_hand','bank_balance_1','accounts_receivable'].reduce((a,k)=>a+val(k),0);
    const liabilities=['supplier_liabilities','bank_loans','other_borrowings'].reduce((a,k)=>a+val(k),0);
    setMetric('Monthly Sales',monthlySales); setMetric('Operating Cash Flow',cashFlow); setMetric('Total Assets',assets); setMetric('Total Liabilities',liabilities); setMetric('Net Worth',assets-liabilities);
    const p=val('amount'), r=num(document.querySelector('[data-key="annual_rate"]')?.value)/1200, t=num(document.querySelector('[data-key="tenure"]')?.value);
    const repayment=p&&t?(r?p*r*Math.pow(1+r,t)/(Math.pow(1+r,t)-1):p/t):0; setMetric('Estimated Monthly Repayment',repayment);
  }
  function formatMoney(e){if(!e||!moneyKeys.has(e.dataset.key))return;const raw=e.value.replace(/[^0-9.]/g,'');if(raw===''){e.value='';return}e.value=Number(raw).toLocaleString('en-NG',{maximumFractionDigits:0});}
  document.addEventListener('input',e=>{const t=e.target;if(!t.matches('[data-key]'))return;if(['nin','bvn'].includes(t.dataset.key)){t.value=t.value.replace(/\D/g,'').slice(0,11);t.classList.toggle('invalid',t.value.length!==11)}recalc();});
  document.addEventListener('blur',e=>{if(e.target?.matches?.('[data-key]')){formatMoney(e.target);recalc();}},true);
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('#next'); if(!btn||bypass)return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if(typeof window.validate==='function' && !window.validate())return;
    btn.disabled=true; const old=btn.textContent; btn.textContent='Saving...';
    try{
      if(typeof window.saveDraft!=='function')throw new Error('Save function is unavailable. Please refresh the page.');
      await window.saveDraft();
      /* saveDraft displays a fallback toast even when persistence fails; verify the customer exists by requiring a saved application/customer id in the current draft. */
      const draft=JSON.parse(localStorage.getItem('loanappraise_v2_draft')||'{}');
      if(!draft.customer_id && !draft.application_id)throw new Error('The customer could not be saved. Please check the required fields and try again.');
      bypass=true; btn.disabled=false; btn.textContent=old; btn.click(); setTimeout(()=>{bypass=false;recalc();},0);
    }catch(err){
      btn.disabled=false;btn.textContent=old;console.error(err);if(typeof window.toast==='function')window.toast('Could not save customer: '+(err?.message||err));else alert('Could not save customer: '+(err?.message||err));
    }
  },true);
  const observer=new MutationObserver(()=>{recalc();}); observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  setTimeout(recalc,200);
})();
