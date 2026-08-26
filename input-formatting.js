// LoanAppraise currency input guidance: display 1,000,000 while preserving numeric values.
(()=>{
 const moneyIds=['kycIncome','kycExpenses','appAmount','appDebt','appCollateral','overrideRecommended'];
 const nairaIds=new Set(moneyIds);
 const clean=v=>String(v??'').replace(/[^0-9.]/g,'');
 const format=v=>{const n=clean(v);if(!n)return '';const parts=n.split('.');parts[0]=parts[0].replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,',');return parts.length>1?parts[0]+'.'+parts[1].slice(0,2):parts[0]};
 function attach(el){if(el.dataset.moneyAttached)return;el.dataset.moneyAttached='1';el.type='text';el.inputMode='decimal';el.autocomplete='off';el.placeholder=el.placeholder||'e.g. 1,000,000';el.addEventListener('input',()=>{const pos=el.selectionStart||0,old=el.value,raw=clean(old);el.value=format(raw);const before=format(old.slice(0,pos)).length;el.setSelectionRange(before,before);});el.addEventListener('blur',()=>{el.value=format(el.value)});el.form?.addEventListener('submit',()=>{el.value=clean(el.value)});}
 function scan(){moneyIds.forEach(id=>{const e=document.getElementById(id);if(e)attach(e)});document.querySelectorAll('input[data-money]').forEach(attach)}
 window.loanAppraiseMoneyValue=id=>{const e=document.getElementById(id);return e?Number(clean(e.value)||0):0};
 window.formatLoanMoney=format;
 const observer=new MutationObserver(scan);observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('load',scan);scan();
})();