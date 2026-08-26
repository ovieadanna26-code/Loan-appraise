// OVAD AFRIKA collateral lending rule: only 30% of stated collateral value counts toward appraisal score.
(()=>{
 const $=id=>document.getElementById(id);
 const fmt=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(Number(n)||0);
 function install(){
  const form=$('appraisalForm');
  if(!form||form.dataset.collateralRuleInstalled)return;
  form.dataset.collateralRuleInstalled='1';
  form.addEventListener('submit',()=>{
   const select=$('appraisalApplication'), id=select?.value;
   const list=window.apps;
   const a=Array.isArray(list)?list.find(x=>x.id===id):null;
   if(!a)return;
   const original=Number(a.collateral_value)||0;
   a.__originalCollateralValue=original;
   a.collateral_value=original*0.30;
   setTimeout(()=>{a.collateral_value=original;delete a.__originalCollateralValue},2500);
  },true);
 }
 function supervisorLabel(){
  const review=document.getElementById('reviewContent');
  if(!review||review.dataset.collateralRuleShown)return;
  const text=review.textContent||'';
  if(!text.includes('Collateral:'))return;
  const a=window.currentReview;
  if(!a)return;
  const original=Number(a.collateral_value)||0, eligible=original*0.30;
  const ps=[...review.querySelectorAll('p')].find(p=>p.textContent.includes('Collateral:'));
  if(ps){ps.insertAdjacentHTML('afterend',`<p><b>Eligible Collateral (30%):</b> ${fmt(eligible)} <span style="font-size:.9em;opacity:.75">(30% of stated collateral value)</span></p>`);review.dataset.collateralRuleShown='1';}
 }
 const observer=new MutationObserver(()=>{install();supervisorLabel()});
 function boot(){install();const r=document.getElementById('reviewContent');if(r)observer.observe(r,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();