/* Financials -> Products repair. Fixes the missing loan application reference and owns step-3 navigation. */
(function(){
'use strict';
function num(v){return Number(String(v??'').replace(/,/g,''))||0}
function draft(){try{return JSON.parse(localStorage.getItem('loanappraise_v2_draft')||'{}')}catch{return {}}}
function makeReference(){const d=draft();if(d.reference)return d.reference;const ref='LA-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,8).toUpperCase();d.reference=ref;localStorage.setItem('loanappraise_v2_draft',JSON.stringify(d));return ref}
async function saveFinancials(){
 if(typeof capture==='function')capture();
 makeReference();
 if(typeof persist==='function'){
   const originalPersist=persist;
   // app.js persist reads state; ensure reference is present for the NOT NULL column.
   if(typeof state==='object')state.reference=draft().reference;
   return await originalPersist('draft');
 }
 return true;
}
function intercept(e){
 const btn=e.target.closest?.('#next');
 if(!btn||typeof step==='undefined'||step!==3)return;
 e.preventDefault();e.stopImmediatePropagation();
 (async()=>{
   try{
     await saveFinancials();
     if(typeof step!=='undefined'&&typeof renderWizard==='function'){step=4;renderWizard()}
   }catch(err){console.error(err);if(typeof toast==='function')toast('Financials could not be saved: '+(err?.message||err))}
 })();
}
document.addEventListener('click',intercept,true);
})();
