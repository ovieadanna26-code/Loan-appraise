/* LoanAppraise 2.0: resilient live calculations and transparent validation feedback. */
(function(){
  'use strict';
  const moneyKeys=new Set(['amount','average_daily_sales','monthly_purchases','rent','salaries','utilities','transport','other_business_expenses','cash_at_hand','bank_balance_1','accounts_receivable','supplier_liabilities','bank_loans','other_borrowings','equipment_value','vehicle_value','property_value','other_assets','market_value','forced_sale_value']);
  const num=v=>Number(String(v??'').replace(/,/g,''))||0;
  const fmt=v=>'₦'+num(v).toLocaleString('en-NG',{maximumFractionDigits:0});
  function stored(){try{return JSON.parse(localStorage.getItem('loanappraise_v2_draft')||'{}')}catch{return {}}}
  function val(k){const e=document.querySelector(`[data-key="${k}"]`);if(e)return num(e.value);return num(stored()[k]);}
  function setMetric(label,value){document.querySelectorAll('.metric').forEach(m=>{const s=m.querySelector('small'),b=m.querySelector('b');if(s&&b&&s.textContent.trim()===label)b.textContent=fmt(value);});}
  function recalc(){
    const monthlySales=val('average_daily_sales')*val('business_days');
    const cashFlow=monthlySales-val('monthly_purchases')-val('rent')-val('salaries')-val('utilities')-val('transport')-val('other_business_expenses');
    const assets=['equipment_value','vehicle_value','property_value','other_assets','cash_at_hand','bank_balance_1','accounts_receivable'].reduce((a,k)=>a+val(k),0);
    const liabilities=['supplier_liabilities','bank_loans','other_borrowings'].reduce((a,k)=>a+val(k),0);
    setMetric('Monthly Sales',monthlySales);
    setMetric('Operating Cash Flow',cashFlow);
    setMetric('Total Assets',assets);
    setMetric('Total Liabilities',liabilities);
    setMetric('Net Worth',assets-liabilities);
    const p=val('amount'),r=val('annual_rate')/1200,t=val('tenure');
    const repayment=p&&t?(r?p*r*Math.pow(1+r,t)/(Math.pow(1+r,t)-1):p/t):0;
    setMetric('Estimated Monthly Repayment',repayment);
  }
  function formatMoney(e){if(!e||!moneyKeys.has(e.dataset.key))return;const raw=e.value.replace(/[^0-9.]/g,'');e.value=raw?Number(raw).toLocaleString('en-NG',{maximumFractionDigits:0}):'';}
  document.addEventListener('input',e=>{const t=e.target;if(!t.matches('[data-key]'))return;if(['nin','bvn'].includes(t.dataset.key)){t.value=t.value.replace(/\D/g,'').slice(0,11);t.classList.toggle('invalid',t.value.length!==11)}recalc();});
  document.addEventListener('blur',e=>{if(e.target?.matches?.('[data-key]')){formatMoney(e.target);recalc();}},true);
  document.addEventListener('click',e=>{
    const btn=e.target.closest('#next');
    if(!btn)return;
    setTimeout(()=>{
      if(btn.disabled)return;
      const invalid=[...document.querySelectorAll('[required]')].filter(x=>!x.value.trim());
      const kyc=['nin','bvn'].map(k=>document.querySelector(`[data-key="${k}"]`)).filter(Boolean).filter(x=>x.value.replace(/\D/g,'').length!==11);
      if(invalid.length||kyc.length){
        const labels=[...invalid,...kyc].map(x=>x.closest('.field')?.querySelector('label')?.textContent?.replace(' *','')||x.dataset.key);
        let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}
        t.textContent='Please complete: '+[...new Set(labels)].join(', ');t.className='toast show';setTimeout(()=>t.className='toast',3500);
      }
    },50);
  });
  const observer=new MutationObserver(()=>setTimeout(recalc,0));observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  setTimeout(recalc,200);
})();
